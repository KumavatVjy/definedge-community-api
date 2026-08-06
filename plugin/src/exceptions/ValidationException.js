'use strict';

const BaseException = require('./BaseException');
const ApiMessages = require('../constants/ApiMessages');

class ValidationException extends BaseException {
    constructor(message = ApiMessages.VALIDATION_FAILED, errors = null) {
        super(message, 400, errors);
    }
}

module.exports = ValidationException;
