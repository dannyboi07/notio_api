const Joi = require("joi");
const {
    HTTP400Error,
    HTTP401Error,
    HTTP403Error,
    HTTP404Error,
    HTTP500Error,
} = require("../common/exceptions");
const express = require("express");

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
function ValidationMiddleware(joiObject, ErrorResponse = HTTP400Error) {
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

module.exports = ValidationMiddleware;
