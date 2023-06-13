const router = require("express").Router();
const mountUri = "/auth";

const ProfileService = require("../service/profile");
const { InputValidation, AuthMiddleware } = require("../middleware");
const {
    createProfile,
    getCreateProfileResponse,
    loginRequest,
    GetMyProfileResponse,
} = require("../schema/profile");

router.post("/register", InputValidation(createProfile), async (req, res) => {
    try {
        const createdProfile = await ProfileService.CreateProfile(req.body);
        return res.json({
            status: "success",
            message: "Your account has been created successfully",
            data: getCreateProfileResponse(createdProfile),
        });
    } catch (error) {
        return res.status(error.statusCode).json({
            status: error.status,
            message: error.message,
        });
    }
});

router.post("/login", InputValidation(loginRequest), async (req, res) => {
    try {
        const { tokens: cookieTokens, profile } =
            await ProfileService.LoginUser(req.body);
        for (const token of cookieTokens) {
            res.cookie(token.name, token.token, {
                maxAge: token.expiresIn * 1000,
                path: token.path,
                httpOnly: true,
            });
        }
        res.status(200).json({
            status: "success",
            message: "Logged in",
            data: GetMyProfileResponse(profile),
        });
    } catch (error) {
        return res.status(error.statusCode).json({
            status: error.status,
            message: error.message,
        });
    }
});

router.get("/refresh", AuthMiddleware, async (req, res) => {
    try {
        const accessToken = await ProfileService.RefreshAccessToken(
            req.userDetails.id,
        );
        res.cookie(accessToken.name, accessToken.token, {
            maxAge: accessToken.expiresIn * 1000,
            path: accessToken.path,
            httpOnly: true,
        });
        res.status(200).json({
            status: "success",
        });
    } catch (error) {
        return res.status(error.statusCode).json({
            status: error.status,
            message: error.message,
        });
    }
});

router.get("/me", AuthMiddleware, async (req, res) => {
    try {
        const profile = req.userDetails;
        res.status(200).json({
            status: "success",
            data: GetMyProfileResponse(profile),
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
