'use strict';

const Logger = require('../helpers/Logger');
const routes = require('../routes');
const Container = require('../container');

class Application {

    async start({ router }) {

        Logger.info('================================');
        Logger.info('Definedge Community API Starting');
        Logger.info('================================');

        Container.register();

        routes(router);

        Logger.info('Routes registered successfully.');
        Logger.info('Plugin initialized successfully.');

    }

}

module.exports = new Application();