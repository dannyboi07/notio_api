const BaseRoutes = require("./base");
const Application = require("../app");
const KanbanController = require("../controller/kanban");

const AuthMiddleware = require("../middleware/auth");
const ValidationMiddleware = require("../middleware/input_validation");

const {
    CreateKanbanBoard,
    CreateKanbanBoardColumn,
    CreateKanbanCard,
    ReorderColumnsRequest,
} = require("../schema/kanban");

class KanbanRoutes extends BaseRoutes {
    /**
     * @param {Application} app
     */
    constructor(app) {
        super("/kanban");
        const kanbanController = new KanbanController(app);

        this.router.get(
            "/all",
            AuthMiddleware(app),
            kanbanController.GetAllUserBoards,
        );
        this.router.post(
            "/",
            AuthMiddleware(app),
            ValidationMiddleware(CreateKanbanBoard),
            kanbanController.CreateBoard,
        );
        this.router.get(
            "/:boardId",
            AuthMiddleware(app),
            kanbanController.GetBoard,
        );
        this.router.post(
            "/:boardId/column",
            AuthMiddleware(app),
            ValidationMiddleware(CreateKanbanBoardColumn),
            kanbanController.CreateColumnOnBoard,
        );
        this.router.post(
            "/:boardId/column/:columnId/card",
            AuthMiddleware(app),
            ValidationMiddleware(CreateKanbanCard),
            kanbanController.CreateCardOnColumn,
        );
        this.router.post(
            "/:boardId/column/reorder",
            AuthMiddleware(app),
            ValidationMiddleware(ReorderColumnsRequest),
            kanbanController.ReorderColumns,
        );
    }
}

module.exports = KanbanRoutes;
