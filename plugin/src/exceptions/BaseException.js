'use strict';

class BaseException extends Error {
    constructor(message = 'An unexpected error occurred.', statusCode = 500, errors = null) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.errors = errors;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = BaseException;
