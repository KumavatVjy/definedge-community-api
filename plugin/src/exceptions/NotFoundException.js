'use strict';

const BaseException = require('./BaseException');
const HttpStatus = require('../constants/HttpStatus');
const ApiMessages = require('../constants/ApiMessages');

class NotFoundException extends BaseException {
    constructor(message = ApiMessages.NOT_FOUND, errors = null) {
        super(message, HttpStatus.NOT_FOUND, errors);
    }
}

module.exports = NotFoundException;
