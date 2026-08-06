'use strict';

const Logger = require('../helpers/Logger');
const registerHealthModule = require('./registrations/health');
const registerCategoryModule = require('./registrations/category');
const registerTopicModule = require('./registrations/topic');

class Container {

    constructor() {
        this.services = new Map();
    }

    /**
     * Register all application dependencies
     */
    register() {

        Logger.info('Registering application dependencies...');

        // Register Health module
        registerHealthModule(this);

        // Register Category module
        registerCategoryModule(this);

        // Register Topic module
        registerTopicModule(this);

    }

    /**
     * Store dependency
     */
    set(name, instance) {
        this.services.set(name, instance);
    }

    /**
     * Retrieve dependency
     */
    get(name) {
        return this.services.get(name);
    }

}

module.exports = new Container();