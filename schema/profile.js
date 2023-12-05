const Joi = require("joi");
const {
    getStringEmpty,
    getStringMinLen,
    getStringMaxLen,
    getStringMustBeAlphaNum,
    getStringRequired,
} = require("./messages");

const CreateProfile = Joi.object({
    username: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required()
        .messages({
            "any.required": getStringRequired("Username"),
            "string.empty": getStringEmpty("Username"),
            "string.min": getStringMinLen("Username"),
            "string.max": getStringMaxLen("Username"),
            "string.alphanum": getStringMustBeAlphaNum("Username"),
        }),
    // TODO: Change min len to 8
    password: Joi.string()
        .min(3)
        .max(30)
        .required()
        .messages({
            "any.required": getStringRequired("Password"),
            "string.empty": getStringEmpty("Password"),
            "string.min": getStringMinLen("Password"),
            "string.max": getStringMaxLen("Password"),
            "string.alphanum": getStringMustBeAlphaNum("Password"),
        }),
    email: Joi.string()
        .email()
        .required()
        .messages({
            "any.required": getStringRequired("Email"),
            "string.empty": getStringEmpty("Email"),
            "string.email": "Email must be a valid email",
        }),
    first_name: Joi.string()
        .min(2)
        .max(30)
        .required()
        .messages({
            "any.required": getStringRequired("First name"),
            "string.empty": getStringEmpty("First name"),
            "string.min": getStringMinLen("First name"),
            "string.max": getStringMaxLen("First name"),
        }),
}).required();

/**
 *
 * @param {Profile} createdProfile
 * @returns {Profile}
 */
const GetCreateProfileResponse = (createdProfile) => ({
    id: createdProfile.id,
    username: createdProfile.username,
    email: createdProfile.email,
    first_name: createdProfile.first_name,
    last_name: createdProfile.last_name,
});

const LoginRequest = Joi.object({
    username: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .messages({
            "string.empty": getStringEmpty("Username"),
            "string.min": getStringMinLen("Username"),
            "string.max": getStringMaxLen("Username"),
            "string.alphanum": getStringMustBeAlphaNum("Username"),
        }),
    password: Joi.string()
        .min(3)
        .max(30)
        .required()
        .messages({
            "string.empty": getStringEmpty("Password"),
            "string.min": getStringMinLen("Password"),
            "string.max": getStringMaxLen("Password"),
            "string.alphanum": getStringMustBeAlphaNum("Password"),
        }),
});

/**
 * @param {Profile} profile
 * @returns {Profile}
 */
const GetMyProfileResponse = (profile) => ({
    id: profile.id,
    username: profile.username,
    email: profile.email,
    first_name: profile.first_name,
    last_name: profile.last_name,
});

module.exports = {
    CreateProfile,
    GetCreateProfileResponse,
    LoginRequest,
    GetMyProfileResponse,
};
