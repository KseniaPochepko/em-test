import config from '@backend/config';
import { Dialect } from 'sequelize';

const connectionConfig = {
  username: config.get('db.username'),
  password: config.get('db.password'),
  database: config.get('db.name'),
  host: config.get('db.host'),
  port: config.get('db.port'),
  logging: config.get('db.logging') ? console.log : false,
  dialect: 'postgres' as Dialect,
};

const sequelizeConfig = {
  local: connectionConfig,
  development: connectionConfig,
  production: connectionConfig,
  test: connectionConfig,
};

export default sequelizeConfig;
module.exports = sequelizeConfig;
