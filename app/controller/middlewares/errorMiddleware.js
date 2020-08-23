const express = require('express');

const errorRouter = express.Router();

// not found middleware
const notFoundMiddleware = (req, res, next) => {
    const err = new Error(`URL ${req.originalUrl} not found`);
    res.status(404);
    next(err);
};

const errorHandlerMiddleware = (error, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: error.message,
        stack: error.stack
    });
};

module.exports = {
    notFoundMiddleware,
    errorHandlerMiddleware
};