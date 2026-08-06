'use strict';

class Logger {

    info(message) {

        console.log(`[Community] ${message}`);

    }

    error(message) {

        console.error(`[Community] ${message}`);

    }

    warn(message) {

        console.warn(`[Community] ${message}`);

    }

}

module.exports = new Logger();