const {
    HTTP400Error,
    HTTP401Error,
    HTTP403Error,
    HTTP404Error,
    HTTP500Error,
} = require("../common/exceptions");
const ProfileService = require("../service/profile");
const Joi = require("joi");
const express = require("express");

function log(req, res, next) {
    console.log(`${req.method} ${req.url}`);
    next();
}

const joiValidationOptions = {
    abortEarly: true,
    allowUnknown: true,
    stripUnknown: true,
};

/**
 * @param {Joi.ObjectSchema} joiObject
 * @param {(HTTP400Error |  HTTP401Error |  HTTP403Error |  HTTP404Error |  HTTP500Error)} ErrorResponse
 * @throws {(HTTP400Error |  HTTP401Error |  HTTP403Error |  HTTP404Error |  HTTP500Error)}
 * @returns {express.RequestHandler}
 * @description
 * This middleware is used to validate the request body against the Joi schema.
 * If the validation fails, it will throw an error.
 * If the validation passes, it will set the req.body to the validated value.
 */
function InputValidation(joiObject, ErrorResponse = HTTP400Error) {
    return function (req, res, next) {
        const { error, value } = joiObject.validate(
            req.body,
            joiValidationOptions,
        );

        if (error) {
            throw new ErrorResponse(
                error.details.map((x) => x.message).join(", "),
            );
        } else {
            req.body = value;
            next();
        }
    };
}

/**
 * @param {Error} err
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {void}
 */
function GlobalErrorHandler(err, req, res, next) {
    console.error("Server Error:", err);
    const statusCode = err?.statusCode ?? 500;
    const status = err?.status ?? "failed";
    const message = err?.message ?? "Internal Server Error";

    res.status(statusCode).json({
        status,
        message,
    });
}

/**
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @throws {HTTP401Error}
 * @returns {Promise<void>}
 */
async function AuthMiddleware(req, res, next) {
    const accessToken = req.cookies?.accessToken ?? "";

    if (!accessToken) {
        throw new HTTP401Error("Missing access token");
    }

    let profile = null;
    try {
        const decodedAccessToken =
            ProfileService.VerifyAccessToken(accessToken);
        profile = await ProfileService.GetProfileById(decodedAccessToken.id);
    } catch (err) {
        console.error(err);

        // if (err.name === "TokenExpiredError") {
        //     throw new HTTP401Error("Session expired");
        // } else if (err.name === "JsonWebTokenError") {
        //     throw new HTTP401Error("Session expired");
        // }
		throw new HTTP401Error("Session expired");
    }

    if (!profile) {
        throw new HTTP401Error("Unauthorized");
    }
    req.userDetails = profile;

    next();
}

module.exports = { log, InputValidation, GlobalErrorHandler, AuthMiddleware };
