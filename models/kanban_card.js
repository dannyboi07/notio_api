const Database = require("../db");
const { Knex } = require("knex");

class KanbanCardModel {
    static tableName = "kanban_card";
    #db;

    /**
     * @param {Database} db
     */
    constructor(db) {
        this.#db = db;
    }

    /**
     * @returns {Knex.QueryBuilder<KanbanCard, {}>}
     */
    get #table() {
        return this.#db.instance(KanbanCardModel.tableName);
    }

    /**
     * @param {number | string} column_id
     * @param {string} title
     * @param {string | null} description
     * @param {number | string} position
     * @returns
     */
    async Insert(column_id, title, description, position) {
        const [card] = await this.#table
            .insert({
                column_id,
                title,
                description,
                position,
            })
            .returning("*");
        return card;
    }
}

module.exports = KanbanCardModel;
