const Joi = require("joi");
const {
    getStringRequired,
    getStringEmpty,
    getStringMinLen,
    getStringMaxLen,
} = require("./messages");

const CreateKanbanBoard = Joi.object({
    title: Joi.string()
        .min(3)
        .max(30)
        .required()
        .messages({
            "any.required": getStringRequired("Title"),
            "string.empty": getStringEmpty("Title"),
            "string.min": getStringMinLen("Title"),
            "string.max": getStringMaxLen("Title"),
        }),
    description: Joi.string()
        .min(3)
        .max(50)
        .required()
        .messages({
            "any.required": getStringRequired("Description"),
            "string.empty": getStringEmpty("Description"),
            "string.min": getStringMinLen("Description"),
            "string.max": getStringMaxLen("Description"),
        }),
});

/**
 * @param {KanbanBoard} kanbanBoard
 * @returns {KanbanBoard}
 */
const GetKanbanBoardResponse = (kanbanBoard) => ({
    id: kanbanBoard.id,
    title: kanbanBoard.title,
    description: kanbanBoard.description,
    created_at: kanbanBoard.created_at,
    updated_at: kanbanBoard.updated_at,
    // TODO: Replace with column parser
    columns: kanbanBoard.columns || [],
});

/**
 * @param {KanbanBoard} createdKanban
 * @returns {KanbanBoard}
 */
const GetCreateKanbanResponse = (createdKanban) =>
    GetKanbanBoardResponse(createdKanban);

/**
 * @param {KanbanBoard[]} kanbanBoards
 * @returns {KanbanBoard[]}
 */
const GetManyKanbanBoardsResponse = (kanbanBoards) =>
    kanbanBoards.map((kanbanBoard) => GetKanbanBoardResponse(kanbanBoard));

module.exports = {
    CreateKanbanBoard,
    GetCreateKanbanResponse,
    GetKanbanBoardResponse,
    GetManyKanbanBoardsResponse,
};
