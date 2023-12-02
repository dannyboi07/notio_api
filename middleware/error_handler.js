const express = require("express");

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

module.exports = GlobalErrorHandler;
