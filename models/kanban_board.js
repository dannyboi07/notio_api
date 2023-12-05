const Database = require("../db");
const { Knex } = require("knex");

class KanbanBoardModel {
    static tableName = "kanban_board";
    #db;

    /**
     * @param {Database} db
     */
    constructor(db) {
        this.#db = db;
    }

    /**
     * @returns {Knex.QueryBuilder<KanbanBoard, {}>}
     */
    get #table() {
        return this.#db.instance(KanbanBoardModel.tableName);
    }

    /**
     * @param {number | string} profile_id
     * @returns {Promise<KanbanBoard[]>}
     */
    async GetBoardsWithProfileId(profile_id) {
        const boards = await this.#table.where({ profile_id });
        return boards;
    }

    /**
     * @param {number | string} id
     * @param {number | string} profile_id
     * @returns {Promise<KanbanBoard>}
     */
    async GetBoardByIdWithProfileId(id, profile_id) {
        return await this.#table
            .where({
                id,
                profile_id,
            })
            .first();
    }

    /**
     * @param {number | string} profile_id
     * @param {string} title
     * @param {string | null} description
     * @returns {Promise<KanbanBoard>}
     */
    async Insert(profile_id, title, description) {
        const [board] = await this.#table
            .insert({
                profile_id,
                title,
                description,
            })
            .returning("*");
        return board;
    }
}

module.exports = KanbanBoardModel;
