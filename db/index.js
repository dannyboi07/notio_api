const Knex = require("knex");

class Database {
    /**
     * @type {Knex.Knex}
     */
    #db;

    constructor(host, port, username, password, database, ssl = false) {
        this.#db = new Knex({
            client: "pg",
            version: "15.3",
            connection: {
                host: host,
                port: port,
                user: username,
                password: password,
                database: database,
                ssl: ssl,
            },
        });
    }

    get instance() {
        return this.#db;
    }
}

module.exports = Database;
