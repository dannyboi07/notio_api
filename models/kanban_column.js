const Database = require("../db");
const { Knex } = require("knex");
const KanbanBoardModel = require("./kanban_board");

class KanbanColumnModel {
    static tableName = "kanban_column";
    #db;

    /**
     * @param {Database} db
     */
    constructor(db) {
        this.#db = db;
    }

    /**
     * @returns {Knex.QueryBuilder<KanbanColumn, {}>}
     */
    get #table() {
        return this.#db.instance(KanbanColumnModel.tableName);
    }

    /**
     * @param {string} title
     * @param {string | null} description
     * @param {number | string} position
     * @param {number | string} board_id
     * @returns {Promise<KanbanColumn>}
     */
    async Insert(title, description, position, board_id) {
        const [column] = await this.#table
            .insert({
                title,
                description,
                position,
                board_id,
            })
            .returning("*");
        return column;
    }

    /**
     * @param {number | string} profile_id
     * @param {number | string} column_id
     * @param {KanbanBoardModel} KanbanBoardModelParam
     * @returns {Promise<KanbanColumn>}
     */
    async GetColumnOnBoardWithProfileId(profile_id, column_id, BoardModel) {
        const column = await this.#table
            .join(
                BoardModel.tableName,
                `${KanbanColumnModel.tableName}.board_id`,
                "=",
                `${BoardModel.tableName}.id`,
            )
            .where({
                [`${BoardModel.tableName}.profile_id`]: profile_id,
                [`${KanbanColumnModel.tableName}.id`]: column_id,
            })
            .first();
        return column;
    }
}

module.exports = KanbanColumnModel;
