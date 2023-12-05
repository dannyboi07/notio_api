const express = require("express");
const Application = require("../app");

const {
    KanbanService,
    UnauthorizedError,
    PositionOccupiedError,
} = require("../service/kanban");
const {
    CreateKanbanBoard,
    GetCreateKanbanResponse,
    GetManyKanbanBoardsResponse,
    CreateKanbanBoardColumn,
    GetCreateKanbanBoardColumnResponse,
    GetManyKanbanBoardColumnsResponse,
    CreateKanbanCard,
    GetCreateKanbanCardResponse,
    UpdateKanbanBoard,
    GetKanbanBoardWithoutColumnResponse,
    ReorderColumnsRequest,
} = require("../schema/kanban");
const { HTTP400Error, HTTP500Error } = require("../common/exceptions");
const { parseInteger } = require("../util");

class KanbanController {
    #service;

    /**
     * @param {Application} app
     */
    constructor(app) {
        this.#service = new KanbanService(app);
        this.GetAllUserBoards = this.GetAllUserBoards.bind(this);
        this.CreateBoard = this.CreateBoard.bind(this);
        this.GetBoard = this.GetBoard.bind(this);
        this.CreateColumnOnBoard = this.CreateColumnOnBoard.bind(this);
        this.CreateCardOnColumn = this.CreateCardOnColumn.bind(this);
        this.ReorderColumns = this.ReorderColumns.bind(this);
    }

    /**
     * @param {express.Request} req
     * @param {express.Response} res
     */
    async GetAllUserBoards(req, res) {
        console.log("passing through here");
        try {
            const boards = await this.#service.GetBoardsByProfileId(
                req.userDetails?.id,
            );
            return res.json({
                status: "success",
                data: GetManyKanbanBoardsResponse(boards),
            });
        } catch (error) {
            console.log(error);
            throw new HTTP500Error("Failed to get your boards");
        }
    }

    /**
     * @param {express.Request} req
     * @param {express.Response} res
     */
    async CreateBoard(req, res) {
        try {
            const board = await this.#service.CreateBoard(
                req.userDetails?.id,
                req.body?.title,
                req.body?.description,
            );

            return res.json({
                status: "success",
                data: GetCreateKanbanResponse(board),
            });
        } catch (error) {
            throw new HTTP500Error("Failed to create your board");
        }
    }

    /**
     * @param {express.Request} req
     * @param {express.Response} res
     */
    async GetBoard(req, res) {
        console.log("passing", req.url, req.baseUrl);
        const [boardId, isNumber] = parseInteger(req.params.boardId);
        if (!isNumber) {
            throw new HTTP400Error("Invalid board ID");
        }

        try {
            const board = await this.#service.GetBoard(
                req.userDetails?.id,
                boardId,
            );

            return res.json({
                status: "success",
                data: board,
            });
        } catch (error) {
            console.log(error);
            throw new HTTP500Error("Failed to get your board");
        }
    }

    /**
     * @param {express.Request} req
     * @param {express.Response} res
     */
    async CreateColumnOnBoard(req, res) {
        const [boardId, isNumber] = parseInteger(req.params.boardId);
        if (!isNumber) {
            throw new HTTP400Error("Invalid board ID");
        }

        try {
            const createdColumn = await this.#service.CreateColumn(
                req.userDetails?.id,
                boardId,
                req.body?.title,
                req.body?.description,
                req.body?.position,
            );

            return res.json({
                status: "success",
                data: GetCreateKanbanBoardColumnResponse(createdColumn),
            });
        } catch (error) {
            console.log(error);
            if (
                error instanceof UnauthorizedError ||
                error instanceof PositionOccupiedError
            ) {
                throw new HTTP400Error(error.message);
            }

            throw new HTTP500Error("Failed to create the column on your board");
        }
    }

    /**
     * @param {express.Request} req
     * @param {express.Response} res
     */
    async CreateCardOnColumn(req, res) {
        const [boardId, isBoardNumber] = parseInteger(req.params.boardId);
        if (!isBoardNumber) {
            throw new HTTP400Error("Invalid board id");
        }
        const [columnId, isColumnNumber] = parseInteger(req.params.columnId);
        if (!isColumnNumber) {
            throw new HTTP400Error("Invalid column id");
        }

        try {
            const createdCard = await this.#service.CreateCard(
                req.userDetails?.id,
                boardId,
                columnId,
                req.body?.title,
                req.body?.description,
                req.body?.position,
            );

            return res.json({
                status: "success",
                data: GetCreateKanbanCardResponse(createdCard),
            });
        } catch (error) {
            console.log(error);
            if (
                error instanceof UnauthorizedError ||
                error instanceof PositionOccupiedError
            ) {
                throw new HTTP400Error(error.message);
            }

            throw new HTTP500Error("Failed to create the card on your board");
        }
    }

    /**
     * @param {express.Request} req
     * @param {express.Response} res
     */
    async ReorderColumns(req, res) {
        const [boardId, isNumber] = parseInteger(req.params.boardId);
        if (!isNumber) {
            throw new HTTP400Error("Invalid board id");
        }

        try {
            const columns = await this.#service.ReorderColumns(
                req.userDetails?.id,
                boardId,
                req.body?.column_ids,
            );

            return res.json({
                status: "success",
                data: GetManyKanbanBoardColumnsResponse(columns),
            });
        } catch (error) {
            if (error instanceof UnauthorizedError) {
                throw new HTTP400Error(error.message);
            }

            throw new HTTP500Error("Failed to reorder columns");
        }
    }
}

module.exports = KanbanController;

// router.get("/all", AuthMiddleware, async (req, res) => {
//     try {
//         const boards = await KanbanService.GetAllUserBoards(req.userDetails?.id);
//         return res.json({
//             status: "success",
//             data: GetManyKanbanBoardsResponse(boards),
//         });
//     } catch (error) {
//         return res.status(error.statusCode).json({
//             status: error.status,
//             message: error.message,
//         });
//     }
// });

// router.post(
//     "/",
//     AuthMiddleware,
//     InputValidation(CreateKanbanBoard),
//     async (req, res) => {
//         try {
//             const createdKanban = await KanbanService.CreateKanbanBoard(
//                 req.body,
//                 req.userDetails?.id,
//             );
//             return res.json({
//                 status: "success",
//                 message: "Kanban board created successfully",
//                 data: GetCreateKanbanResponse(createdKanban),
//             });
//         } catch (error) {
//             return res.status(error.statusCode).json({
//                 status: error.status,
//                 message: error.message,
//             });
//         }
//     },
// );

// router.post(
//     "/:boardId/column",
//     AuthMiddleware,
//     InputValidation(CreateKanbanBoardColumn),
//     async (req, res) => {
//         try {
//             const [boardId, isNumber] = parseInteger(req.params.boardId);
//             if (!isNumber) {
//                 throw new HTTP400Error("Invalid board id");
//             }

//             const createdColumn = await KanbanService.CreateKanbanBoardColumn(
//                 {
//                     ...req.body,
//                     board_id: boardId,
//                 },
//                 req.userDetails?.id,
//             );
//             return res.json({
//                 status: "success",
//                 message: "Kanban board column created successfully",
//                 data: GetCreateKanbanBoardColumnResponse(createdColumn),
//             });
//         } catch (error) {
//             return res.status(error.statusCode).json({
//                 status: error.status,
//                 message: error.message,
//             });
//         }
//     },
// );

// router.post(
//     "/:boardId/column/:columnId/card",
//     AuthMiddleware,
//     InputValidation(CreateKanbanCard),
//     async (req, res) => {
//         try {
//             const [boardId, isBoardNumber] = parseInteger(req.params.boardId);
//             if (!isBoardNumber) {
//                 throw new HTTP400Error("Invalid board id");
//             }
//             const [columnId, isColumnNumber] = parseInteger(
//                 req.params.columnId,
//             );
//             if (!isColumnNumber) {
//                 throw new HTTP400Error("Invalid column id");
//             }

//             const createdCard = await KanbanService.CreateKanbanBoardCard(
//                 {
//                     ...req.body,
//                     board_id: boardId,
//                     column_id: columnId,
//                 },
//                 req.userDetails?.id,
//             );
//             return res.json({
//                 status: "success",
//                 message: "Kanban board card created successfully",
//                 data: GetCreateKanbanCardResponse(createdCard ?? {}),
//             });
//         } catch (error) {
//             return res.status(error.statusCode).json({
//                 status: error.status,
//                 message: error.message,
//             });
//         }
//     },
// );

// router.get("/:boardId", AuthMiddleware, async (req, res) => {
//     try {
//         const [boardId, isNumber] = parseInteger(req.params.boardId);
//         if (!isNumber) {
//             throw new HTTP400Error("Invalid board id");
//         }

//         const board = await KanbanService.GetKanbanBoardWithColumnsAndCards(
//             boardId,
//             req.userDetails?.id,
//         );
//         return res.json({
//             status: "success",
//             // data: GetCreateKanbanResponse(board),
//             data: board,
//         });
//     } catch (error) {
//         return res.status(error.statusCode).json({
//             status: error.status,
//             message: error.message,
//         });
//     }
// });

// router.put(
//     "/:boardId",
//     AuthMiddleware,
//     InputValidation(UpdateKanbanBoard),
//     async (req, res) => {
//         try {
//             const [boardId, isNumber] = parseInteger(req.params.boardId);
//             if (!isNumber) {
//                 throw new HTTP400Error("Invalid board id");
//             }

//             const updatedBoard = await KanbanService.UpdateKanbanBoard(
//                 {
//                     id: boardId,
//                     ...req.body,
//                 },
//                 req.userDetails?.id,
//             );
//             return res.json({
//                 status: "success",
//                 message: "Kanban board updated successfully",
//                 data: GetKanbanBoardWithoutColumnResponse(updatedBoard),
//             });
//         } catch (error) {
//             return res.status(error.statusCode).json({
//                 status: error.status,
//                 message: error.message,
//             });
//         }
//     },
// );

// router.put(
//     "/:boardId/column/reorder",
//     AuthMiddleware,
//     InputValidation(ReorderColumnsRequest),
//     async (req, res) => {
//         try {
//             const [boardId, isNumber] = parseInteger(req.params.boardId);
//             if (!isNumber) {
//                 throw new HTTP400Error("Invalid board id");
//             }

//             const updatedBoard = await KanbanService.UpdateKanbanBoard(
//                 {
//                     id: boardId,
//                     ...req.body,
//                 },
//                 req.userDetails?.id,
//             );
//             return res.json({
//                 status: "success",
//                 message: "Kanban board updated successfully",
//                 data: GetKanbanBoardWithoutColumnResponse(updatedBoard),
//             });
//         } catch (error) {
//             return res.status(error.statusCode).json({
//                 status: error.status,
//                 message: error.message,
//             });
//         }
//     },
// );

// module.exports = {
//     router,
//     mountUri,
// };
