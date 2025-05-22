import { RequestStatus } from '@backend/components/requests/requests.types';
import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';

import RequestAction from './requestAction';

@Table({
  tableName: 'requests',
  timestamps: true,
  underscored: true,
})
export default class Request extends Model {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  id: number;

  @Column({ type: DataType.STRING, allowNull: false })
  title: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  content: string;

  @Column({ type: 'enum_requests_status', allowNull: false, defaultValue: RequestStatus.Pending })
  status: RequestStatus;

  @HasMany(() => RequestAction)
  history: RequestAction[] = [];
}
