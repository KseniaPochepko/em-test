import { RequestActionType } from '@backend/components/requests/requests.types';
import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';

import Request from './request';

@Table({
  tableName: 'request_actions',
  timestamps: true,
  underscored: true,
})
export default class RequestAction extends Model {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  id: number;
  @Column({ type: 'enum_request_actions_type', allowNull: false })
  type: RequestActionType;
  @Column({ type: DataType.TEXT, allowNull: true })
  content: string | null;

  @ForeignKey(() => Request)
  requestId: number;

  @BelongsTo(() => Request)
  request: Request;
}
