const db = require("../db");
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
 * @typedef {Object} KanbanBoardWithColumnsAndCardsRaw
 * @property {number} board_id
 * @property {number} board_profile_id
 * @property {string} board_title
 * @property {string} board_description
 * @property {Date} board_created_at
 * @property {Date} board_updated_at
 * @property {number} column_id
 * @property {number} column_board_id
 * @property {string} column_title
 * @property {string} column_description
 * @property {number} column_position
 * @property {Date} column_created_at
 * @property {Date} column_updated_at
 * @property {number} card_id
 * @property {number} card_column_id
 * @property {string} card_title
 * @property {string} card_description
 * @property {number} card_position
 * @property {Date} card_created_at
 * @property {Date} card_updated_at
 * @param {number | string} boardId
 * @param {number | string} profileId
 * @returns {KanbanBoardWithColumnsAndCardsRaw[]}
 */
function getKanbanBoardById(boardId, profileId) {
    return db
        .raw(
            `SELECT
			kanban_board.id AS board_id,
			kanban_board.profile_id AS board_profile_id,
			kanban_board.title AS board_title,
			kanban_board.description AS board_description,
			kanban_board.created_at AS board_created_at,
			kanban_board.updated_at AS board_updated_at,
			kanban_column.id AS column_id,
			kanban_column.board_id AS column_board_id,
			kanban_column.title AS column_title,
			kanban_column.description AS column_description,
			kanban_column.position AS column_position,
			kanban_column.created_at AS column_created_at,
			kanban_column.updated_at AS column_updated_at,
			kanban_card.id AS card_id,
			kanban_card.column_id AS card_column_id,
			kanban_card.title AS card_title,
			kanban_card.description AS card_description,
			kanban_card.position AS card_position,
			kanban_card.created_at AS card_created_at,
			kanban_card.updated_at AS card_updated_at
			FROM kanban_board
			JOIN kanban_column ON kanban_board.id = kanban_column.board_id
			LEFT JOIN kanban_card ON kanban_column.id = kanban_card.column_id
			WHERE kanban_board.id = ${boardId}
			AND kanban_board.profile_id = ${profileId}
			GROUP BY kanban_board.id, kanban_column.id, kanban_card.id
			ORDER BY kanban_column.position ASC, kanban_card.position ASC;`,
        )
        .then((res) => {
            return res?.rows ?? [];
        });
}

/**
 * @param {KanbanBoardWithColumnsAndCardsRaw[]} board
 * @returns {KanbanBoardWithColumnsAndCards | null}
 */
function parseKanbanBoardWithColumnsAndCards(board) {
    if (!board || !board.length) {
        return null;
    }

    const columnCards = board.reduce((acc, curr) => {
        const card = {
            id: curr.card_id,
            column_id: curr.card_column_id,
            title: curr.card_title,
            description: curr.card_description,
            position: curr.card_position,
            created_at: curr.card_created_at,
            updated_at: curr.card_updated_at,
        };

        if (acc[curr.column_id]) {
            if (!card.id) {
                return acc;
            }
            acc[curr.column_id].cards.push(card);
        } else {
            acc[curr.column_id] = {
                id: curr.column_id,
                board_id: curr.column_board_id,
                title: curr.column_title,
                description: curr.column_description,
                position: curr.column_position,
                created_at: curr.column_created_at,
                updated_at: curr.column_updated_at,
                cards: card.id ? [card] : [],
            };
        }

        return acc;
    }, {});

    const parsedBoard = {
        id: board[0].board_id,
        profile_id: board[0].board_profile_id,
        title: board[0].board_title,
        description: board[0].board_description,
        created_at: board[0].board_created_at,
        updated_at: board[0].board_updated_at,
        columns: Object.values(columnCards),
    };

    return parsedBoard;
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

async function GetKanbanBoardWithColumnsAndCards(boardId, profileId) {
    let board = null;
    try {
        board = await getKanbanBoardById(boardId, profileId);
    } catch (error) {
        console.log("Failed to get board from db, err:", error);
        throw new HTTP500Error("Failed to fetch board");
    }
    if (!board) {
        throw new HTTP500Error("Failed to fetch board");
    }

    return parseKanbanBoardWithColumnsAndCards(board);
}

/**
 * @param {UpdateBoard} board
 * @param {number | string} profileId
 * @returns {KanbanBoard}
 */
async function UpdateKanbanBoard(board, profileId) {
    let updatedBoard = null;
    try {
        [updatedBoard] = await KanbanBoardModel()
            .where({ id: board.id, profile_id: profileId })
            .update({
                title: board.title,
                description: board.description,
            })
            .returning("*");
    } catch (error) {
        console.log("Failed to update board in db, err:", error);
        throw new HTTP500Error("Failed to update board");
    }
    if (!updatedBoard) {
        throw new HTTP500Error("Failed to update board");
    }

    return updatedBoard;
}

/**
 *
 * @param {number | string} boardId
 * @param {Array<number | string>} columnIds
 * @param {number | string} profileId
 * @returns {KanbanColumn[]}
 */
async function ReorderBoardColumns(boardId, columnIds, profileId) {
    // let boardExists = null;
    // try {
    // 	boardExists = (await KanbanBoardModel()
    // 		.where({ id: boardId, profile_id: profileId })
    // 		.first())
    // 		? true
    // 		: false;
    // } catch (error) {
    // 	console.log("Failed to get board from db, err:", error);
    // 	throw new HTTP500Error("Failed to reorder columns");
    // }

    // if (!boardExists) {
    // 	throw new HTTP401Error("Unauthorized");
    // }

    let columnCount = 0;
    try {
        columnCount = await KanbanColumnModel()
            .select("id")
            .join(
                "kanban_board",
                "kanban_column.board_id",
                "=",
                "kanban_board.id",
            )
            .where({
                "kanban_board.profile_id": profileId,
                "kanban_column.board_id": boardId,
            })
            .count("id")
            .first();
    } catch (error) {
        console.log("Failed to get column count from db, err:", error);
        throw new HTTP500Error("Failed to reorder columns");
    }

    if (!columnCount) {
        throw new HTTP500Error("Failed to reorder columns");
    } else if (columnCount.count !== columnIds.length) {
        throw new HTTP401Error("Unauthorized");
    }

    // let updatedColumns = null;
    try {
        await db.transaction(async (trx) => {
            const queries = columnIds.map((columnId, index) => {
                return KanbanColumnModel(trx)
                    .where({ id: columnId, board_id: boardId })
                    .update({ position: index })
                    .transacting(trx);
            });

            return Promise.all(queries);
        });
    } catch (error) {
        console.log("Failed to reorder columns in db, err:", error);
        throw new HTTP500Error("Failed to reorder columns");
    }
    // if (!updatedColumns) {
    //     throw new HTTP500Error("Failed to reorder columns");
    // }

    let board = null;
    try {
        board = await GetKanbanBoardWithColumnsAndCards(boardId, profileId);
    } catch (error) {
        console.log("Failed to get board from db, err:", error);
        throw new HTTP500Error("Order updated, but failed to fetch board");
    }
    if (!board) {
        throw new HTTP500Error("Order updated, but failed to fetch board");
    }

    return board;
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

/**
 * @typedef {Object} UpdateBoard
 * @property {number} id
 * @property {string} title
 * @property {string} description
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
    GetKanbanBoardWithColumnsAndCards,
    UpdateKanbanBoard,
};
