const { HTTP400Error, HTTP401Error } = require("../common/exceptions");
const ProfileService = require("../service/profile");

function log(req, res, next) {
    console.log(`${req.method} ${req.url}`);
    next();
}

const joiValidationOptions = {
    abortEarly: true,
    allowUnknown: true,
    stripUnknown: true,
};

function inputValidation(joiObject, ErrorResponse = HTTP400Error) {
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

function globalErrorHandler(err, req, res, next) {
    const statusCode = err?.statusCode ?? 500;
    const status = err?.status ?? "failed";
    const message = err?.message ?? "Internal Server Error";

    return res.status(statusCode).json({
        status,
        message,
    });
}

function authMiddleware(req, res, next) {
    const accessToken = req.cookies?.accessToken ?? "";

    let profile = null;
    try {
        const decodedAccessToken =
            ProfileService.verifyAccessToken(accessToken);
        profile = ProfileService.getProfileById(decodedAccessToken.id);
    } catch (err) {
        console.error(err);

        if (err.name === "TokenExpiredError") {
            // return res.status(401).json({ error: "Session expired" });
            throw new HTTP401Error("Session expired");
        } else if (err.name === "JsonWebTokenError") {
            throw new HTTP401Error("Session expired");
            // return res
            //     .status(401)
            //     .json({ error: "Malformed auth token, re-login" });
        }
    }

    if (!profile) {
        throw new HTTP401Error("Unauthorized");
    }
    req.userDetails = profile;

    next();
}

module.exports = { log, inputValidation, globalErrorHandler, authMiddleware };
