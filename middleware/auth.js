const express = require("express");
const Application = require("../app");
const { ProfileService } = require("../service/profile");
const { HTTP401Error, HTTP500Error } = require("../common/exceptions");

/**
 * @param {Application} app
 */
function AuthMiddleware(app) {
    /**
     * @param {express.Request} req
     * @param {express.Response} res
     * @param {express.NextFunction} next
     * @throws {HTTP401Error}
     * @returns {Promise<void>}
     */
    return async function (req, res, next) {
        const accessToken = req.cookies?.accessToken ?? "";

        if (!accessToken) {
            throw new HTTP401Error("Missing access token");
        }

        let profile = null;
        const profileService = new ProfileService(app);

        const [decodedAccessToken, isValid] =
            await profileService.VerifyAccessToken(accessToken);
        if (!isValid) {
            throw new HTTP401Error("Session expired");
        }

        try {
            profile = await profileService.GetProfileById(
                decodedAccessToken.id,
            );
        } catch (err) {
            console.error("AuthMiddleware:", err);
            throw new HTTP500Error();
        }

        if (!profile) {
            throw new HTTP401Error();
        }
        req.userDetails = profile;

        next();
    };
}

module.exports = AuthMiddleware;
