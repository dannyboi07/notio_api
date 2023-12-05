const express = require("express");
const Application = require("../app");

const {
    ProfileService,
    ProfileExistsError,
    InvalidCredentialsError,
} = require("../service/profile");
const {
    GetCreateProfileResponse,
    GetMyProfileResponse,
} = require("../schema/profile");
const {
    HTTP500Error,
    HTTP400Error,
    HTTP401Error,
} = require("../common/exceptions");

class AuthController {
    #service;

    /**
     * @param {Application} app
     */
    constructor(app) {
        this.#service = new ProfileService(app);
        // Binding methods to this instance, otherwise their scope is the global scope,
        // some weird JS stuff (Why isn't this behaviour in other classes?)
        this.RegisterUser = this.RegisterUser.bind(this);
        this.LoginUser = this.LoginUser.bind(this);
        this.LogoutUser = this.LogoutUser.bind(this);
        this.RefreshAccessToken = this.RefreshAccessToken.bind(this);
        this.GetMyProfile = this.GetMyProfile.bind(this);
    }

    /**
     * @param {express.Request} req
     * @param {express.Response} res
     */
    async RegisterUser(req, res) {
        try {
            const createdProfile = await this.#service.CreateProfile(
                req.body?.email,
                req.body?.username,
                req.body?.password,
                req.body?.first_name,
            );
            return res.json({
                status: "success",
                message: "Your account has been created successfully",
                data: GetCreateProfileResponse(createdProfile),
            });
        } catch (error) {
            console.log(error);
            if (error instanceof ProfileExistsError) {
                throw new HTTP400Error(error.message);
            }

            throw new HTTP500Error("Failed to create profile");
        }
    }

    /**
     * @param {express.Request} req
     * @param {express.Response} res
     */
    async LoginUser(req, res) {
        try {
            const { profile, tokens } = await this.#service.LoginUser(
                req.body?.username,
                req.body?.password,
            );
            for (const token of tokens) {
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
            console.log(error);
            if (error instanceof InvalidCredentialsError) {
                throw new HTTP401Error(error.message);
            }

            throw new HTTP500Error("Failed to login");
        }
    }

    /**
     * @param {express.Request} req
     * @param {express.Response} res
     */
    async LogoutUser(req, res) {
        try {
            const tokensToDelete = await this.#service.LogoutUser(
                req.userDetails.id,
            );
            for (const token of tokensToDelete) {
                [
                    res.clearCookie(token.name, {
                        path: token.path,
                    }),
                ];
            }
            res.status(200).json({
                status: "success",
                message: "Logged out",
            });
        } catch (error) {
            console.log(error);
            throw new HTTP500Error("Failed to logout");
        }
    }

    /**
     * @param {express.Request} req
     * @param {express.Response} res
     */
    async RefreshAccessToken(req, res) {
        try {
            const refreshToken = req.cookies?.refreshToken ?? "";
            const accessToken = await this.#service.RefreshAccessToken(
                refreshToken,
            );

            res.cookie(accessToken.name, accessToken.token, {
                maxAge: accessToken.expiresIn * 1000,
                path: accessToken.path,
                httpOnly: true,
            });
            return res.status(200).json({
                status: "success",
            });
        } catch (error) {
            console.log(error);
            if (error instanceof InvalidCredentialsError) {
                throw new HTTP401Error(error.message);
            }

            throw new HTTP500Error("Failed to refresh access token");
        }
    }

    /**
     * @param {express.Request} req
     * @param {express.Response} res
     */
    async GetMyProfile(req, res) {
        try {
            const profile = req.userDetails;
            res.status(200).json({
                status: "success",
                data: GetMyProfileResponse(profile),
            });
        } catch (error) {
            console.log(error);
            throw new HTTP500Error("Failed to fetch profile");
        }
    }
}

module.exports = AuthController;
