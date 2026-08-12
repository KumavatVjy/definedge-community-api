'use strict';

const BaseException = require('./BaseException');
const HttpStatus = require('../constants/HttpStatus');
const ApiMessages = require('../constants/ApiMessages');

class AuthenticationException extends BaseException {
    constructor(message = ApiMessages.UNAUTHORIZED, errors = null) {
        super(message, HttpStatus.UNAUTHORIZED, errors);
    }
}

module.exports = AuthenticationException;
