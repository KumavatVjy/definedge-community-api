'use strict';

const Response = require('../helpers/Response');

class BaseController {

    /**
     * Get authenticated user ID from request object
     * @param {Object} req
     * @returns {number}
     */
    getUserId(req) {
        if (!req) return 0;
        if (req.uid && Number(req.uid) > 0) return Number(req.uid);
        if (req.user && req.user.uid && Number(req.user.uid) > 0) return Number(req.user.uid);
        if (req.session && req.session.passport && req.session.passport.user && Number(req.session.passport.user) > 0) {
            return Number(req.session.passport.user);
        }
        return 0;
    }

    sendSuccess(res, message, data = null, status = 200) {

        return res.status(status).json(
            Response.success(message, data)
        );

    }

    sendError(res, message, errors = null, status = 500) {

        return res.status(status).json(
            Response.error(message, errors)
        );

    }

}

module.exports = BaseController;