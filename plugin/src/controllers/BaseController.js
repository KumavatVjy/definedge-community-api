'use strict';

const Response = require('../helpers/Response');

class BaseController {

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