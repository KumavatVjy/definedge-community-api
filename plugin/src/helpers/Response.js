'use strict';

class Response {

    success(message, data = null) {

        return {

            success: true,

            message,

            data,

            errors: null

        };

    }

    error(message, errors = null) {

        return {

            success: false,

            message,

            data: null,

            errors

        };

    }

}

module.exports = new Response();