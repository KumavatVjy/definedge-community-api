'use strict';

const Response = require('../helpers/Response');
const Logger = require('../helpers/Logger');
const BaseException = require('../exceptions/BaseException');
const ApiMessages = require('../constants/ApiMessages');

module.exports = (err, req, res, next) => {
    if (!req.originalUrl || !req.originalUrl.includes('/api/v1')) {
        return next(err);
    }

    if (res.headersSent) {
        return next(err);
    }

    if (err instanceof BaseException) {
        Logger.warn(`[${err.name}] ${err.message} - ${req.originalUrl}`);
        return res.status(err.statusCode).json(
            Response.error(err.message, err.errors)
        );
    }

    Logger.error(`[UnhandledError] ${err.message} - ${req.originalUrl}\n${err.stack}`);

    const statusCode = err.statusCode || err.status || 500;
    const message = err.message || ApiMessages.INTERNAL_SERVER_ERROR;

    return res.status(statusCode).json(
        Response.error(message, null)
    );
};
