const {config}=require('./src/config')

module.exports = {
  development: {
    client: "mysql2",
    connection: {
      host: config.DATABASE_URL,
      port: config.DATABASE_PORT,
      user: config.DATABASE_USER,
      password: config.DATABASE_PASSWORD,
      database: config.DATABASE_NAME
    },

    migrations: {
      directory: "./database/migrations"
    },

    seeds: {
      directory: "./database/seeds"
    }
  }
};