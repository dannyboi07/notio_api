const BaseRoutes = require("./base");
const Application = require("../app");
const AuthController = require("../controller/auth");

const ValidationMiddleware = require("../middleware/input_validation");
const AuthMiddleware = require("../middleware/auth");
const { CreateProfile, LoginRequest } = require("../schema/profile");

class AuthRoutes extends BaseRoutes {
    /**
     * @param {Application} app
     */
    constructor(app) {
        super("/auth");
        const authController = new AuthController(app);

        this.router.post(
            "/register",
            ValidationMiddleware(CreateProfile),
            authController.RegisterUser,
        );
        this.router.post(
            "/login",
            ValidationMiddleware(LoginRequest),
            authController.LoginUser,
        );
        this.router.get(
            "/logout",
            AuthMiddleware(app),
            authController.LogoutUser,
        );
        this.router.get("/refresh", authController.RefreshAccessToken);
        this.router.get(
            "/me",
            AuthMiddleware(app),
            authController.GetMyProfile,
        );
    }
}

module.exports = AuthRoutes;
