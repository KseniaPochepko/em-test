import convict from 'convict';
import dotenv from 'dotenv';

dotenv.config();

const config = convict({
  app: {
    name: {
      doc: 'Application name',
      format: String,
      default: 'Requests-Api',
    },
  },
  server: {
    port: {
      doc: 'Port on which app server is listening',
      default: '3000',
      format: String,
      env: 'PORT',
    },
  },
  db: {
    host: { doc: 'Database host', format: String, default: 'localhost', env: 'DB_HOST' },
    username: { doc: 'Database username', format: String, default: 'postgres', env: 'DB_USERNAME' },
    password: { doc: 'Database password', format: String, default: 'postgres', env: 'DB_PASSWORD' },
    name: { doc: 'Database name', format: String, default: 'emt', env: 'DB_NAME' },
    port: { doc: 'Database port', format: Number, default: 5432, env: 'DB_PORT' },
    logging: { doc: 'Database logging', format: Boolean, default: false, env: 'DB_LOGGING' },
  },
});

config.validate({ allowed: 'strict' });

export default config;
