const router = require("express").Router();
const Application = require("../app");
const AuthController = require("../controller/auth");

const ValidationMiddleware = require("../middleware/input_validation");
const AuthMiddleware = require("../middleware/auth");
const { CreateProfile, LoginRequest } = require("../schema/profile");

class AuthRoutes {
    #app;
    #router;
    #controller;
    static mountUri = "/auth";

    /**
     * @param {Application} app
     */
    constructor(app) {
        this.#app = app;
        this.#router = router;
        this.#controller = new AuthController(this.#app);

        this.#router.post(
            "/register",
            ValidationMiddleware(CreateProfile),
            this.#controller.RegisterUser,
        );
        this.#router.post(
            "/login",
            ValidationMiddleware(LoginRequest),
            this.#controller.LoginUser,
        );
        this.#router.get(
            "/logout",
            AuthMiddleware,
            this.#controller.LogoutUser,
        );
        this.#router.get("/refresh", this.#controller.RefreshAccessToken);
        this.#router.get("/me", AuthMiddleware, this.#controller.GetMyProfile);
    }

    get router() {
        return this.#router;
    }
}

module.exports = AuthRoutes;
