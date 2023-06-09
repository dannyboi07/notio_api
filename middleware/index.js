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

        if (err.name === "TokenExpiredError") {
            throw new HTTP401Error("Session expired");
        } else if (err.name === "JsonWebTokenError") {
            throw new HTTP401Error("Session expired");
        }
    }

    if (!profile) {
        throw new HTTP401Error("Unauthorized");
    }
    req.userDetails = profile;

    next();
}

module.exports = { log, InputValidation, GlobalErrorHandler, AuthMiddleware };
