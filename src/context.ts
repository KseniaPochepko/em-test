import { IAppContext } from '@backend/app.types';
import { RequestsComponent } from '@backend/components/requests';
import dbConfig from '@backend/config/db';
import { Database } from '@backend/db';

export class AppContext implements IAppContext {
  readonly database: Database;
  readonly requests: RequestsComponent;

  constructor() {
    // Common components
    this.database = new Database(dbConfig.development);
    // Business components
    this.requests = new RequestsComponent(this.database);
  }
}
