const router = require("express").Router();
const mountUri = "/kanban";

const KanbanService = require("../service/kanban");
const { InputValidation, AuthMiddleware } = require("../middleware");
const {
    CreateKanbanBoard,
    GetCreateKanbanResponse,
    GetManyKanbanBoardsResponse,
} = require("../schema/kanban");

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

module.exports = {
    router,
    mountUri,
};
