const express = require("express");

/**
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 */
function RequestLogger(req, res, next) {
    console.log(`${req.method} ${req.url}`);
    next();
}

module.exports = RequestLogger;
