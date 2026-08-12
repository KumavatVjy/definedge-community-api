'use strict';

const BaseException = require('./BaseException');
const HttpStatus = require('../constants/HttpStatus');
const ApiMessages = require('../constants/ApiMessages');

class AuthorizationException extends BaseException {
    constructor(message = ApiMessages.FORBIDDEN, errors = null) {
        super(message, HttpStatus.FORBIDDEN, errors);
    }
}

module.exports = AuthorizationException;
