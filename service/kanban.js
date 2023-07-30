const {
    KanbanBoardModel,
    KanbanColumnModel,
    KanbanCardModel,
} = require("../models/kanban");
const {
    HTTP500Error,
    HTTP404Error,
    HTTP400Error,
    HTTP401Error,
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
 * @param {CreateBoardCard} card
 * @param {number | string} profileId
 * @returns {KanbanCard}
 */
async function CreateKanbanBoardCard(card, profileId) {
    let boardExists = null;
    try {
        boardExists = (await KanbanBoardModel()
            .join(
                "kanban_column",
                "kanban_board.id",
                "=",
                "kanban_column.board_id",
            )
            .where({
                "kanban_board.profile_id": profileId,
                "kanban_column.id": card.column_id,
            })
            .first())
            ? true
            : false;
    } catch (error) {
        console.log("Failed to get board from db, err:", error);
        throw new HTTP500Error("Failed to create card");
    }

    if (!boardExists) {
        throw new HTTP401Error("Unauthorized");
    }

    let createdCard = null;
    try {
        [createdCard] = await KanbanCardModel()
            .insert({
                column_id: card.column_id,
                title: card.title,
                description: card.description,
                position: card.position,
            })
            .returning("*");
    } catch (error) {
        console.log("Failed to create card in db, err:", error);

        // catch unique error thrown by postgres knex, when card position is already taken
        if (error.code === "23505") {
            throw new HTTP400Error("Card position already taken");
        }
        throw new HTTP500Error("Failed to create card");
    }
    if (!createdCard) {
        throw new HTTP500Error("Failed to create card");
    }

    return createdCard;
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

/**
 * @typedef {Object} CreateBoardCard
 * @property {number} column_id
 * @property {string} title
 * @property {string} description
 * @property {number} position
 */

// * @property {number} priority
// * @property {number} points
// * @property {number} assignee_id
// * @property {number} reporter_id
// * @property {Date} due_date
// * @property {Date} start_date
// * @property {Date} end_date
// * @property {string} color
// * @property {string} tags
// * @property {string} attachments
// * @property {string} comments
// * @property {string} checklist
// * @property {string} checklist_items

module.exports = {
    CreateKanbanBoard,
    GetAllUserBoards,
    CreateKanbanBoardColumn,
    CreateKanbanBoardCard,
};
