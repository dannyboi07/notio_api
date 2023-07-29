const {
    KanbanBoardModel,
    KanbanColumnModel,
    KanbanCardModel,
} = require("../models/kanban");
const {
    HTTP500Error,
    HTTP404Error,
    HTTP400Error,
} = require("../common/exceptions");

/**
 * @param {number | string} profileId
 * @returns {KanbanBoard[]}
 */
function getUserBoards(profileId) {
    return KanbanBoardModel().where({ profile_id: profileId });
}

/**
 * @param {number | string} boardId
 * @param {number | string} profileId
 * @returns {KanbanBoard}
 * Returns board WITHOUT columns and cards
 */
function getKanbanBoardByIdShallow(boardId, profileId) {
    return KanbanBoardModel()
        .where({ id: boardId, profile_id: profileId })
        .first();
}

/**
 * @param {CreateBoard} board
 * @param {number | string} profileId
 * @returns {KanbanBoard}
 */
async function CreateKanbanBoard(board, profileId) {
    let createdBoard = null;
    try {
        [createdBoard] = await KanbanBoardModel()
            .insert({
                title: board.title,
                description: board.description,
                profile_id: profileId,
            })
            .returning("*");
    } catch (error) {
        console.log("Failed to create board in db, err:", error);
        throw new HTTP500Error("Failed to create board");
    }
    if (!createdBoard) {
        throw new HTTP500Error("Failed to create board");
    }

    return createdBoard;
}

/**
 * @param {number | string} profileId
 * @returns {KanbanBoard[]}
 */
async function GetAllUserBoards(profileId) {
    let boards = null;
    try {
        boards = await getUserBoards(profileId);
    } catch (error) {
        console.log("Failed to get all user boards from db, err:", error);
        throw new HTTP500Error("Failed to fetch your boards");
    }
    if (!boards) {
        throw new HTTP500Error("Failed to fetch your boards");
    }

    return boards;
}

/**
 * @param {CreateBoardColumn} column
 * @param {number | string} profileId
 * @returns {KanbanColumn}
 */
async function CreateKanbanBoardColumn(column, profileId) {
    let relatedBoard = null;
    try {
        relatedBoard = await getKanbanBoardByIdShallow(
            column.board_id,
            profileId,
        );
    } catch (error) {
        console.log("Failed to get board from db, err:", error);
        throw new HTTP500Error("Failed to create column");
    }
    if (!relatedBoard || relatedBoard?.id !== column.board_id) {
        throw new HTTP404Error("Board not found");
    }

    let createdColumn = null;
    try {
        [createdColumn] = await KanbanColumnModel()
            .insert({
                board_id: column.board_id,
                title: column.title,
                description: column.description,
                position: column.position,
            })
            .returning("*");
    } catch (error) {
        console.log("Failed to create column in db, err:", error);
        // catch unique error thrown by postgres knex, when column position is already taken
        if (error.code === "23505") {
            throw new HTTP400Error("Column position already taken");
        }
        throw new HTTP500Error("Failed to create column");
    }
    if (!createdColumn) {
        throw new HTTP500Error("Failed to create column");
    }

    return createdColumn;
}

/**
 * @typedef {Object} CreateBoard
 * @property {string} title
 * @property {string} description
 */

/**
 * @typedef {Object} CreateBoardColumn
 * @property {number} board_id
 * @property {string} title
 * @property {string} description
 * @property {number} position
 */

module.exports = {
    CreateKanbanBoard,
    GetAllUserBoards,
    CreateKanbanBoardColumn,
};
