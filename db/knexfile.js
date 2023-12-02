const Application = require("../app");
const Config = require("../config");
const { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PW } = new Config();

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
    [Application.enviroments.DEV]: {
        client: "postgresql",
        connection: {
            host: DB_HOST,
            port: DB_PORT,
            database: DB_NAME,
            user: DB_USER,
            password: DB_PW,
        },
        pool: {
            min: 2,
            max: 10,
        },
        migrations: {
            tableName: "knex_migrations",
        },
    },

    [Application.enviroments.PROD]: {
        client: "postgresql",
        connection: {
            host: DB_HOST,
            port: DB_PORT,
            database: DB_NAME,
            user: DB_USER,
            password: DB_PW,
        },
        pool: {
            min: 2,
            max: 10,
        },
        migrations: {
            tableName: "knex_migrations",
        },
    },
};
