'use strict';

const BaseException = require('./BaseException');
const HttpStatus = require('../constants/HttpStatus');
const ApiMessages = require('../constants/ApiMessages');

class ValidationException extends BaseException {
    constructor(message = ApiMessages.VALIDATION_FAILED, errors = null) {
        super(message, HttpStatus.BAD_REQUEST, errors);
    }
}

module.exports = ValidationException;
