import { requestsRouter } from '@backend/components/requests';
import config from '@backend/config';
import { AppContext } from '@backend/context';
import { handleError } from '@backend/middlewares';
import cors from 'cors';
import express, { Express } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import multer from 'multer';

export class App {
  private readonly context = new AppContext();
  private readonly server: Express;

  private setupMiddlewares() {
    this.server.use(cors());
    this.server.use(express.json());
    this.server.use(express.urlencoded());
    this.server.use(multer().none());
    this.server.use(morgan('tiny'));
    this.server.use(helmet());
  }

  private setupRoutes() {
    this.server.use('/requests', requestsRouter);
  }
  constructor() {
    this.server = express();
    this.server.set('context', this.context);
    this.setupMiddlewares();
    this.setupRoutes();
    this.server.use(handleError);
  }

  async init() {
    await this.context.database.init();
    this.server.listen(config.get('server.port'));
    console.log(`Server is listening on port ${config.get('server.port')}`);
  }
}
