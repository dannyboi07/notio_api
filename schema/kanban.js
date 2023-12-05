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
const GetKanbanBoardWithoutColumnResponse = (kanbanBoard) => ({
    id: kanbanBoard.id,
    title: kanbanBoard.title,
    description: kanbanBoard.description,
    created_at: kanbanBoard.created_at,
    updated_at: kanbanBoard.updated_at,
});

/**
 * @param {KanbanBoard} kanbanBoard
 * @returns {KanbanBoard}
 */
const GetKanbanBoardResponse = (kanbanBoard) => ({
    ...GetKanbanBoardWithoutColumnResponse(kanbanBoard),
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

const CreateKanbanBoardColumn = Joi.object({
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
    position: Joi.number()
        .required()
        .messages({
            "any.required": getStringRequired("Position"),
            "number.base": getStringRequired("Position"),
        }),
});

/**
 * @param {KanbanColumn} kanbanBoardColumn
 * @returns {KanbanColumn}
 */
const GetKanbanBoardColumnResponse = (kanbanBoardColumn) => ({
    id: kanbanBoardColumn.id,
    board_id: kanbanBoardColumn.board_id,
    title: kanbanBoardColumn.title,
    description: kanbanBoardColumn.description,
    position: kanbanBoardColumn.position,
    created_at: kanbanBoardColumn.created_at,
    updated_at: kanbanBoardColumn.updated_at,
});

/**
 * @param {KanbanColumn[]} kanbanBoardColumns
 * @returns {KanbanColumn[]}
 */
const GetManyKanbanBoardColumnsResponse = (kanbanBoardColumns) =>
    kanbanBoardColumns.map((kanbanBoardColumn) =>
        GetKanbanBoardColumnResponse(kanbanBoardColumn),
    );

/**
 * @param {KanbanColumn} createdKanbanBoardColumn
 * @returns {KanbanColumn}
 */
const GetCreateKanbanBoardColumnResponse = (createdKanbanBoardColumn) =>
    GetKanbanBoardColumnResponse(createdKanbanBoardColumn);

const CreateKanbanCard = Joi.object({
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
    position: Joi.number()
        .required()
        .messages({
            "any.required": getStringRequired("Position"),
            "number.base": getStringRequired("Position"),
        }),
});

/**
 * @param {KanbanCard} kanbanCard
 * @returns {KanbanCard}
 */
const GetKanbanCardResponse = (kanbanCard) => ({
    id: kanbanCard.id,
    column_id: kanbanCard.column_id,
    title: kanbanCard.title,
    description: kanbanCard.description,
    position: kanbanCard.position,
    created_at: kanbanCard.created_at,
    updated_at: kanbanCard.updated_at,
});

/**
 * @param {KanbanCard} createdKanbanCard
 * @returns {KanbanCard}
 */
const GetCreateKanbanCardResponse = (createdKanbanCard) =>
    GetKanbanCardResponse(createdKanbanCard);

const UpdateKanbanBoard = Joi.object({
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

const ReorderColumnsRequest = Joi.object({
    column_ids: Joi.array()
        .items(
            Joi.number()
                .required()
                .messages({
                    "any.required": getStringRequired("Column id"),
                    "number.base": getStringRequired("Column id"),
                }),
        )
        .required()
        .messages({
            "any.required": getStringRequired("Columns"),
            "array.base": getStringRequired("Columns"),
        }),
});

module.exports = {
    CreateKanbanBoard,
    GetCreateKanbanResponse,
    GetKanbanBoardWithoutColumnResponse,
    GetKanbanBoardResponse,
    GetManyKanbanBoardsResponse,
    CreateKanbanBoardColumn,
    GetKanbanBoardColumnResponse,
    GetManyKanbanBoardColumnsResponse,
    GetCreateKanbanBoardColumnResponse,
    CreateKanbanCard,
    GetKanbanCardResponse,
    GetCreateKanbanCardResponse,
    UpdateKanbanBoard,
    ReorderColumnsRequest,
};
