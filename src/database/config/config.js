// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

module.exports = {
  development: {
    url: process.env.DEV_DATABASE_URL,
    dialect: 'postgres',
    logging: false,
    omitNull: true,
  },
  test: {
    url: process.env.TEST_DATABASE_URL,
    dialect: 'postgres',
    omitNull: true
  },
  production: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    omitNull: true,
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  },
};