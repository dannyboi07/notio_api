const router = require("express").Router();
const mountUri = "/kanban";

const KanbanService = require("../service/kanban");
const { InputValidation, AuthMiddleware } = require("../middleware");
const {
    CreateKanbanBoard,
    GetCreateKanbanResponse,
    GetManyKanbanBoardsResponse,
    CreateKanbanBoardColumn,
    GetCreateKanbanBoardColumnResponse,
    CreateKanbanCard,
    GetCreateKanbanCardResponse,
} = require("../schema/kanban");
const { HTTP400Error } = require("../common/exceptions");

router.get("/all", AuthMiddleware, async (req, res) => {
    try {
        const boards = await KanbanService.GetAllUserBoards(req.userDetails.id);
        return res.json({
            status: "success",
            data: GetManyKanbanBoardsResponse(boards),
        });
    } catch (error) {
        return res.status(error.statusCode).json({
            status: error.status,
            message: error.message,
        });
    }
});

router.post(
    "/",
    AuthMiddleware,
    InputValidation(CreateKanbanBoard),
    async (req, res) => {
        try {
            const createdKanban = await KanbanService.CreateKanbanBoard(
                req.body,
                req.userDetails.id,
            );
            return res.json({
                status: "success",
                message: "Kanban board created successfully",
                data: GetCreateKanbanResponse(createdKanban),
            });
        } catch (error) {
            return res.status(error.statusCode).json({
                status: error.status,
                message: error.message,
            });
        }
    },
);

router.post(
    "/:boardId/column",
    AuthMiddleware,
    InputValidation(CreateKanbanBoardColumn),
    async (req, res) => {
        try {
            let boardId = null;
            try {
                boardId = parseInt(req.params.boardId, 10);
            } catch (error) {
                throw new HTTP400Error("Invalid board id");
            }

            const createdColumn = await KanbanService.CreateKanbanBoardColumn(
                {
                    ...req.body,
                    board_id: boardId,
                },
                req.userDetails.id,
            );
            return res.json({
                status: "success",
                message: "Kanban board column created successfully",
                data: GetCreateKanbanBoardColumnResponse(createdColumn),
            });
        } catch (error) {
            return res.status(error.statusCode).json({
                status: error.status,
                message: error.message,
            });
        }
    },
);

router.post(
    "/:boardId/column/:columnId/card",
    AuthMiddleware,
    InputValidation(CreateKanbanCard),
    async (req, res) => {
        try {
            let boardId = null;
            let columnId = null;
            try {
                boardId = parseInt(req.params.boardId, 10);
            } catch (error) {
                throw new HTTP400Error("Invalid board id");
            }
            try {
                columnId = parseInt(req.params.columnId, 10);
            } catch (error) {
                throw new HTTP400Error("Invalid column id");
            }

            const createdCard = await KanbanService.CreateKanbanBoardCard(
                {
                    ...req.body,
                    board_id: boardId,
                    column_id: columnId,
                },
                req.userDetails.id,
            );
            return res.json({
                status: "success",
                message: "Kanban board card created successfully",
                data: GetCreateKanbanCardResponse(createdCard ?? {}),
            });
        } catch (error) {
            return res.status(error.statusCode).json({
                status: error.status,
                message: error.message,
            });
        }
    },
);

module.exports = {
    router,
    mountUri,
};
