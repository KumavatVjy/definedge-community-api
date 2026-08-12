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

    if (err.message && typeof err.message === 'string' && (
        err.message.includes('self-vote') ||
        err.message.includes('cant-vote-own-post') ||
        err.message.includes('cant-follow-self') ||
        err.message.includes('cant-unfollow-self') ||
        err.message.includes('self-follow') ||
        err.message.includes('no-privileges')
    )) {
        let message = ApiMessages.FORBIDDEN;
        if (err.message.includes('self-vote') || err.message.includes('cant-vote-own-post')) {
            message = ApiMessages.SELF_VOTE_FORBIDDEN || 'You cannot vote on your own post.';
        } else if (err.message.includes('cant-follow-self') || err.message.includes('cant-unfollow-self') || err.message.includes('self-follow')) {
            message = ApiMessages.SELF_FOLLOW_FORBIDDEN || 'You cannot follow yourself.';
        }
        Logger.warn(`[NodeBBPermissionError] ${err.message} - ${req.originalUrl}`);
        return res.status(403).json(
            Response.error(message, null)
        );
    }

    if (err.message && typeof err.message === 'string' && (
        err.message.includes('already-bookmarked') ||
        err.message.includes('already-unbookmarked')
    )) {
        Logger.warn(`[NodeBBBookmarkError] ${err.message} - ${req.originalUrl}`);
        return res.status(400).json(
            Response.error(err.message, null)
        );
    }

    Logger.error(`[UnhandledError] ${err.message} - ${req.originalUrl}\n${err.stack}`);

    const statusCode = err.statusCode || err.status || 500;
    const message = err.message || ApiMessages.INTERNAL_SERVER_ERROR;

    return res.status(statusCode).json(
        Response.error(message, null)
    );
};
