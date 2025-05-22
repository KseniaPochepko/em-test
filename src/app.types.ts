import { RequestsComponent } from '@backend/components/requests';
import { Database } from '@backend/db';

export interface IAppContext {
  database: Database;
  requests: RequestsComponent;
}
