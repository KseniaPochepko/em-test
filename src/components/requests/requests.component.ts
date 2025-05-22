import {
  CreateRequestInput,
  ListRequestsOptions,
  ListRequestsResponse,
  RequestActionType,
  RequestItem,
  RequestStatus,
  UpdateRequestInput,
} from '@backend/components/requests/requests.types';
import { Database } from '@backend/db';
import Request from '@backend/db/models/request';
import RequestAction from '@backend/db/models/requestAction';
import { BadRequest, NotFound } from 'http-errors';
import { isNil, omitBy } from 'lodash';
import { Op, WhereOptions } from 'sequelize';

export class RequestsComponent {
  private readonly database: Database;
  constructor(database: Database) {
    this.database = database;
  }
  async list(options: ListRequestsOptions): Promise<ListRequestsResponse> {
    const { page, perPage, toDate, fromDate } = options;
    const offset = (page - 1) * perPage;

    const where: WhereOptions = {};

    if (fromDate || toDate) {
      where.createdAt = omitBy(
        {
          [Op.gte]: fromDate,
          [Op.lt]: toDate,
        },
        isNil,
      );
    }

    const { rows, count: total } = await Request.findAndCountAll({
      where,
      include: [{ model: RequestAction }],
      offset,
      limit: perPage,
      order: [['id', 'desc']],
    });

    const totalPages = Math.ceil(total / perPage);

    return {
      items: rows.map((row) => row.get()),
      page,
      perPage,
      totalPages,
      total,
      hasMore: page < totalPages,
    };
  }

  async get(id: string): Promise<RequestItem> {
    const item = await Request.findOne({
      where: { id },
      include: [{ model: RequestAction }],
    });

    if (!item) throw new NotFound('Request');

    return item.get();
  }
  async create(input: CreateRequestInput): Promise<RequestItem> {
    const created = await Request.create(input);
    return created.get();
  }
  async update(id: string, input: UpdateRequestInput): Promise<RequestItem> {
    const { status, message } = input;
    const item = await Request.findByPk(id);

    if (!item) throw new NotFound('Request');

    // validate changes
    const allowedStatuses = RequestsComponent.AllowedStatusMap[item.status] ?? [];
    if (status && !allowedStatuses.includes(status)) {
      throw new BadRequest(`Unable to make ${item.status} request ${status}`);
    }

    await this.database.connection.transaction(async (transaction) => {
      if (status) {
        item.status = status;
        await item.save({ transaction });
      }
      const actionType = status
        ? RequestsComponent.RequestActionMap[status]
        : RequestActionType.Comment;

      if (!actionType) throw new BadRequest(`Unable to update request status to ${status}`);

      await RequestAction.create(
        {
          type: actionType,
          requestId: item.id,
          content: message,
        },
        { transaction },
      );
    });

    return this.get(id);
  }
  async rejectAll(message: string | null): Promise<{ updated: number }> {
    const updated = await this.database.connection.transaction(async (transaction) => {
      const [count, rows] = await Request.update(
        { status: RequestStatus.Rejected },
        {
          where: { status: RequestStatus.InProgress },
          returning: ['id'],
          transaction,
        },
      );

      const actions = rows.map((row) => ({
        requestId: row.id,
        type: RequestActionType.Reject,
        content: message,
      }));

      await RequestAction.bulkCreate(actions, { transaction });

      return count;
    });

    return { updated };
  }

  static AllowedStatusMap: { [status: string]: RequestStatus[] } = {
    [RequestStatus.Pending]: [RequestStatus.InProgress, RequestStatus.Rejected],
    [RequestStatus.InProgress]: [RequestStatus.Resolved, RequestStatus.Rejected],
    [RequestStatus.Resolved]: [],
    [RequestStatus.Rejected]: [],
  };

  static RequestActionMap: { [status: string]: RequestActionType } = {
    [RequestStatus.InProgress]: RequestActionType.Accept,
    [RequestStatus.Resolved]: RequestActionType.Resolve,
    [RequestStatus.Rejected]: RequestActionType.Reject,
  };
}
