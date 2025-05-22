import { IdParam } from '@backend/common/schema';
import { ListRequestsOptions, RequestStatus } from '@backend/components/requests/requests.types';
import { AppContext } from '@backend/context';
import { validate } from '@backend/middlewares/validate';
import { Request, Response, Router } from 'express';
import wrap from 'express-async-wrap';

import {
  CreateRequestBody,
  ListRequestsQuery,
  RequestActionBody,
  UpdateRequestBody,
} from './requests.schema';

const requestsRouter = Router();

//просто разметила себе методы, которые потом будут

requestsRouter.get(
  '/',
  validate(null, { query: ListRequestsQuery }),
  wrap(async (req: Request, res: Response) => {
    const context: AppContext = req.app.get('context');
    const options = req.query as unknown as ListRequestsOptions;
    const response = await context.requests.list(options);
    res.json(response);
  }),
);

requestsRouter.get(
  '/:id',
  validate(null, { params: IdParam }),
  wrap(async (req: Request, res: Response) => {
    const context: AppContext = req.app.get('context');
    const response = await context.requests.get(req.params.id);
    res.json(response);
  }),
);

requestsRouter.post(
  '/',
  validate(CreateRequestBody),
  wrap(async (req: Request, res: Response) => {
    const context: AppContext = req.app.get('context');
    const response = await context.requests.create(req.body);
    res.json(response);
  }),
);

requestsRouter.patch(
  '/:id',
  validate(UpdateRequestBody, { params: IdParam }),
  wrap(async (req: Request, res: Response) => {
    const context: AppContext = req.app.get('context');
    const response = await context.requests.update(req.params.id, req.body);
    res.json(response);
  }),
);

requestsRouter.post(
  '/reject-all',
  validate(RequestActionBody),
  wrap(async (req: Request, res: Response) => {
    const context: AppContext = req.app.get('context');
    const response = await context.requests.rejectAll(req.body.message ?? null);
    res.json(response);
  }),
);

requestsRouter.post(
  '/:id/accept',
  validate(RequestActionBody, { params: IdParam }),
  wrap(async (req: Request, res: Response) => {
    const context: AppContext = req.app.get('context');
    const input = { ...req.body, status: RequestStatus.InProgress };
    const response = await context.requests.update(req.params.id, input);
    res.json(response);
  }),
);

requestsRouter.post(
  '/:id/resolve',
  validate(RequestActionBody, { params: IdParam }),
  wrap(async (req: Request, res: Response) => {
    const context: AppContext = req.app.get('context');
    const input = { ...req.body, status: RequestStatus.Resolved };
    const response = await context.requests.update(req.params.id, input);
    res.json(response);
  }),
);

requestsRouter.post(
  '/:id/reject',
  validate(RequestActionBody, { params: IdParam }),
  wrap(async (req: Request, res: Response) => {
    const context: AppContext = req.app.get('context');
    const input = { ...req.body, status: RequestStatus.Rejected };
    const response = await context.requests.update(req.params.id, input);
    res.json(response);
  }),
);

// TODO implement reopen logic if nesessary

export { requestsRouter };
