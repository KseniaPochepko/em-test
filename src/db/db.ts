import { Sequelize, SequelizeOptions } from 'sequelize-typescript';

import models from './models';

export class Database {
  public readonly connection: Sequelize;
  constructor(config: SequelizeOptions) {
    config.models = models;
    this.connection = new Sequelize(config);
  }

  async init() {
    await this.connection.authenticate();
  }
}
