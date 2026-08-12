'use strict';

const HttpStatus = require('../constants/HttpStatus');

class BaseException extends Error {
    constructor(message, statusCode = HttpStatus.INTERNAL_SERVER_ERROR, errors = null) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.errors = errors;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = BaseException;
