const { ProfileModel } = require("../models/profile");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Application = require("../app");
const Config = require("../config");
// Import breaking due to circular dependency, TODO: fix
// const { mountUri: AuthMountUri } = require("../controller/auth");

/**
 * @typedef {Object} AccessTokenPayload
 * @property {number | string} id
 * @property {string} username
 */

/**
 * @typedef {Object} RefreshTokenPayload
 * @property {number | string} id
 */

/**
 * @typedef {Object} Token
 * @property {string} token
 * @property {string} name
 * @property {string} path
 * @property {number} expiresIn
 */

class ProfileExistsError extends Error {
    constructor(message) {
        super(message);
        this.name = "ProfileExistsError";
    }
}

class InvalidCredentialsError extends Error {
    constructor(message) {
        super(message);
        this.name = "InvalidCredentialsError";
    }
}

class ProfileService {
    static #ACCESS_TOKEN_EXPIRY = 60 * 60; // 1 hour
    static #REFRESH_TOKEN_EXPIRY = 60 * 60 * 24 * 7; // 7 days
    #app;

    /**
     *	@param {Application} app
     */
    constructor(app) {
        this.#app = app;
        // Not needed, binding for consistency with controller's code
        this.GetProfileById = this.GetProfileById.bind(this);
        this.CreateProfile = this.CreateProfile.bind(this);
        this.LoginUser = this.LoginUser.bind(this);
        this.LogoutUser = this.LogoutUser.bind(this);
        this.VerifyAccessToken = this.VerifyAccessToken.bind(this);
        this.RefreshAccessToken = this.RefreshAccessToken.bind(this);
    }

    static async #getHashedPw(password, saltRounds) {
        return bcrypt.hash(password, saltRounds);
    }

    static async #verifyPw(password, hashedPw) {
        return bcrypt.compare(password, hashedPw);
    }

    /**
     * @param {Config} config
     * @param {number | string} userId
     * @param {string} userName
     * @returns {Token}
     */
    #createAccessToken = (config, userId, userName) => ({
        name: "accessToken",
        token: jwt.sign(
            {
                id: userId,
                username: userName,
            },
            config.ACCESS_TOKEN_SECRET,
            {
                expiresIn: ProfileService.#ACCESS_TOKEN_EXPIRY,
            },
        ),
        expiresIn: ProfileService.#ACCESS_TOKEN_EXPIRY,
        path: config.BASE,
    });

    /**
     * @param {Config} config
     * @param {number | string} userId
     * @param {string} userName
     * @returns {Token}
     */
    #createRefreshToken = (config, userId) => ({
        name: "refreshToken",
        token: jwt.sign(
            {
                id: userId,
            },
            config.REFRESH_TOKEN_SECRET,
            {
                expiresIn: ProfileService.#REFRESH_TOKEN_EXPIRY,
            },
        ),
        expiresIn: ProfileService.#REFRESH_TOKEN_EXPIRY,
        path: `${config.BASE}/auth/refresh`,
    });

    /**
     * @param {number | string} id
     * @returns {Promise<Profile>}
     */
    async GetProfileById(id) {
        return new ProfileModel(this.#app.db).selectById(id);
    }

    /**
     * @param {string} email
     * @param {string} username
     * @param {string} password
     * @param {string} first_name
     * @returns {Profile}
     */
    async CreateProfile(email, username, password, first_name) {
        let existingUser = null;
        const profileModel = new ProfileModel(this.#app.db);
        try {
            existingUser = await profileModel.selectByEmailAndUsername(
                email,
                username,
            );
        } catch (error) {
            console.error(
                "Failed to get profile by email & username from db",
                error,
            );
            throw new Error();
        }

        if (existingUser) {
            throw new ProfileExistsError("Account already exists");
        }

        let hashedPw = null;
        try {
            hashedPw = await ProfileService.#getHashedPw(
                password,
                this.#app.config.PW_SALT_RND,
            );
        } catch (error) {
            console.error("Failed to create hashed pw", error);
            throw new Error();
        }

        let createdProfile = null;
        try {
            createdProfile = await profileModel.insertProfile(
                email,
                username,
                hashedPw,
                first_name,
            );
        } catch (error) {
            console.error("Failed to create profile in db", error);
            throw new Error();
        }

        return createdProfile;
    }

    /**
     * @typedef {Object} LoginUserReturn
     * @property {Profile} profile
     * @property {Array<Token>} tokens
     * @param {string} username
     * @param {string} password
     * @returns {LoginUserReturn}
     * @description
     * tokens[0] is the access token, tokens[1] is the refresh token
     */
    async LoginUser(username, password) {
        let userProfile = null;
        try {
            userProfile = await new ProfileModel(this.#app.db).selectByUsername(
                username,
            );
        } catch (error) {
            console.error("Failed to get user from db", error);
            throw new Error();
        }

        if (
            !userProfile ||
            !(await ProfileService.#verifyPw(password, userProfile.password))
        ) {
            throw new InvalidCredentialsError("Incorrect password");
        }

        return {
            profile: userProfile,
            tokens: [
                this.#createAccessToken(
                    this.#app.config,
                    userProfile.id,
                    userProfile.username,
                ),
                this.#createRefreshToken(this.#app.config, userProfile.id),
            ],
        };
    }

    /**
     * Method returns an array of dummy tokens, to pass the cookie token details to be deleted
     * @param {number | string} profileId
     * @returns {Array<Token>}
     */
    async LogoutUser(profileId) {
        return [
            {
                name: "accessToken",
                token: "",
                expiresIn: 0,
                path: this.#app.config.BASE,
            },
            {
                name: "refreshToken",
                token: "",
                expiresIn: 0,
                path: `${this.#app.config.BASE}/auth/refresh}`,
            },
        ];
    }

    /**
     * @param {string} token
     * @param {string} accessTokenSecret
     * @returns {Promise<AccessTokenPayload>}
     */
    static async #verifyAccessToken(token, accessTokenSecret) {
        return new Promise((resolve, reject) =>
            jwt.verify(token, accessTokenSecret, (err, payload) => {
                err ? reject(err) : resolve(payload);
            }),
        );
    }

    /**
     * @param {string} token
     * @returns {[AccessTokenPayload, boolean]}
     */
    async VerifyAccessToken(token) {
        let [payload, isValid] = [null, false];
        try {
            payload = await ProfileService.#verifyAccessToken(
                token,
                this.#app.config.ACCESS_TOKEN_SECRET,
            );
            isValid = true;
        } catch (error) {
            console.error("Failed to verify access token", error);
        }

        return [payload, isValid];
    }

    /**
     * @param {string} token
     * @param {string} refreshTokenSecret
     * @returns {Promise<RefreshTokenPayload>}
     */
    static async #verifyRefreshToken(token, refreshTokenSecret) {
        return new Promise((resolve, reject) =>
            jwt.verify(token, refreshTokenSecret, (err, payload) => {
                err ? reject(err) : resolve(payload);
            }),
        );
    }

    /**
     * @param {string} refreshToken
     * @returns {Token}
     */
    async RefreshAccessToken(refreshToken) {
        let decodedRefreshToken = null;
        try {
            decodedRefreshToken = await ProfileService.#verifyRefreshToken(
                refreshToken,
                this.#app.config.REFRESH_TOKEN_SECRET,
            );
        } catch (error) {
            console.error("Failed to verify refresh token", error);
            throw new InvalidCredentialsError("Unauthorized");
        }

        let userProfile = null;
        try {
            userProfile = await this.GetProfileById(decodedRefreshToken.id);
        } catch (error) {
            console.error("Failed to get user from db", error);
            throw new Error();
        }

        if (!userProfile) {
            console.warn(
                "Refresh token request issued for non-existent user, profileId:",
                profileId,
            );
            throw new InvalidCredentialsError("Unauthorized");
        }

        return this.#createAccessToken(
            this.#app.config,
            userProfile.id,
            userProfile.username,
        );
    }
}

module.exports = {
    ProfileService,
    ProfileExistsError,
    InvalidCredentialsError,
};
