const ProfileModel = require("../models/profile");
const {
    HTTP500Error,
    HTTP400Error,
    HTTP401Error,
} = require("../common/exceptions");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../config");

const getHashedPw = (password) => bcrypt.hash(password, config.PW_SALT_RND);
const verifyPw = (password, hashedPw) => bcrypt.compare(password, hashedPw);

const ACCESS_TOKEN_EXPIRY = 60 * 60;
const REFRESH_TOKEN_EXPIRY = 60 * 60 * 24 * 7;
/**
 * @param {(number | string)} userId
 * @param {string} userName
 * @returns {string}
 */
const createAccessTokenJwt = (userId, userName) =>
    jwt.sign(
        {
            id: userId,
            username: userName,
        },
        config.ACCESS_TOKEN_SECRET,
        {
            expiresIn: ACCESS_TOKEN_EXPIRY, // 1 hour
        },
    );
/**
 * @param {(number | string)} userId
 * @returns {string}
 */
const createRefreshTokenJwt = (userId) =>
    jwt.sign(
        {
            id: userId,
        },
        config.REFRESH_TOKEN_SECRET,
        {
            expiresIn: REFRESH_TOKEN_EXPIRY, // 7 days
        },
    );
const verifyAccessToken = (token) =>
    jwt.verify(token, config.ACCESS_TOKEN_SECRET);
const verifyRefreshToken = (token) =>
    jwt.verify(token, config.REFRESH_TOKEN_SECRET);

/**
 * @param {(number | string)} userId
 * @returns {Profile}
 */
function getProfileById(userId) {
    return ProfileModel().where({ id: userId }).first();
}

/**
 * @param {string} userName
 * @returns {Profile}
 */
function getProfileByUsername(userName) {
    return ProfileModel().where({ username: userName }).first();
}

/**
 * @param {string} email
 * @returns {Profile}
 */
function getProfileByEmail(email) {
    return ProfileModel().where({ email: email }).first();
}

/**
 * @param {string} email
 * @param {string} userName
 * @returns {Profile}
 */
function getProfileByEmailAndUsername(email, userName) {
    return ProfileModel().where({ email: email, username: userName }).first();
}

/**
 *
 * @param {CreateProfile} profileDetails
 * @returns {Profile}
 */
async function createProfile(profileDetails) {
    let existingUser = null;
    try {
        existingUser = await getProfileByEmailAndUsername(
            profileDetails.email,
            profileDetails.username,
        );
    } catch (error) {
        console.log("Failed to get profile by email & username from db", error);
        throw new HTTP500Error("Failed to create profile");
    }
    if (existingUser) {
        throw new HTTP400Error("Account already exists");
    }

    let hashedPw = null;
    try {
        hashedPw = await getHashedPw(profileDetails.password);
    } catch (error) {
        console.log("Failed to create hashed pw", error);
        throw new HTTP500Error("Failed to create profile");
    }

    let createdProfile = null;
    try {
        [createdProfile] = await ProfileModel()
            .insert({
                username: profileDetails.username,
                password: hashedPw,
                email: profileDetails.email,
                first_name: profileDetails.first_name,
            })
            .returning("*");
    } catch (error) {
        console.log("Failed to create profile in db", error);
        throw new HTTP500Error("Failed to create profile");
    }

    return createdProfile;
}

/**
 * @param {LoginUser} profileDetails
 * @returns {Array<Token>} Return[0] is the access token, Return[1] is the refresh token
 */
async function loginUser(profileDetails) {
    let userProfile = null;
    try {
        userProfile = await getProfileByUsername(profileDetails.username);
    } catch (error) {
        console.log("Failed to get user from db", error);
        throw new HTTP500Error("Failed to login");
    }
    if (
        !userProfile ||
        !(await verifyPw(profileDetails.password, userProfile.password))
    ) {
        // User's profile doesn't exist, but do not let the user know that a profile exists or not, that's leakage of info
        // Instead say that the Password is incorrect
        throw new HTTP401Error("Incorrect password");
    }

    const accessToken = createAccessTokenJwt(
        userProfile.id,
        userProfile.username,
    );
    const refreshToken = createRefreshTokenJwt(userProfile.id);

    return [
        {
            token: accessToken,
            name: "accessToken",
            path: config.BASE,
            expiresIn: ACCESS_TOKEN_EXPIRY,
        },
        {
            token: refreshToken,
            name: "refreshToken",
            path: `${config.BASE}/auth/refresh`,
            expiresIn: REFRESH_TOKEN_EXPIRY,
        },
    ];
}

/**
 *
 * @param {(number | string)} profileId
 * @returns {Token}
 */
async function refreshAccessToken(profileId) {
    let userProfile = null;
    try {
        userProfile = await getProfileById(profileId);
    } catch (error) {
        console.log("Failed to get user from db", error);
        throw new HTTP500Error("Failed to refresh user tokens");
    }
    if (!userProfile) {
        throw new HTTP401Error("Unauthorized");
    }

    return createAccessTokenJwt(userProfile.id, userProfile.username);
}

module.exports = {
    getProfileById,
    createProfile,
    loginUser,
    refreshAccessToken,
    verifyAccessToken,
    verifyRefreshToken,
};

/**
 * @typedef {Object} CreateProfile
 * @property {string} username
 * @property {string} password
 * @property {string} email
 * @property {string} first_name
 */

/**
 * @typedef {Object} LoginUser
 * @property {string} username
 * @property {string} password
 */

/**
 * @typedef {Object} Token
 * @property {string} token
 * @property {string} name
 * @property {string} path
 * @property {number} expiresIn
 */
