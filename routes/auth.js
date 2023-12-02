const BaseRoutes = require("./base");
const Application = require("../app");
const AuthController = require("../controller/auth");

const ValidationMiddleware = require("../middleware/input_validation");
const AuthMiddleware = require("../middleware/auth");
const { CreateProfile, LoginRequest } = require("../schema/profile");

class AuthRoutes extends BaseRoutes {
    #controller;

    /**
     * @param {Application} app
     */
    constructor(app) {
        super(app, "/auth");
        this.#controller = new AuthController(this.app);

        this.router.post(
            "/register",
            ValidationMiddleware(CreateProfile),
            this.#controller.RegisterUser,
        );
        this.router.post(
            "/login",
            ValidationMiddleware(LoginRequest),
            this.#controller.LoginUser,
        );
        this.router.get("/logout", AuthMiddleware, this.#controller.LogoutUser);
        this.router.get("/refresh", this.#controller.RefreshAccessToken);
        this.router.get("/me", AuthMiddleware, this.#controller.GetMyProfile);
    }
}

module.exports = AuthRoutes;
