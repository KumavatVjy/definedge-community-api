'use strict';

const BaseException = require('./BaseException');
const ApiMessages = require('../constants/ApiMessages');

class NotFoundException extends BaseException {
    constructor(message = ApiMessages.NOT_FOUND, errors = null) {
        super(message, 404, errors);
    }
}

module.exports = NotFoundException;
