'use strict';

const Logger = require('../helpers/Logger');
const registerHealthModule = require('./registrations/health');
const registerCategoryModule = require('./registrations/category');
const registerTopicModule = require('./registrations/topic');
const registerPostModule = require('./registrations/post');
const registerUserModule = require('./registrations/user');
const registerSearchModule = require('./registrations/search');

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

        // Register Post module
        registerPostModule(this);

        // Register User module
        registerUserModule(this);

        // Register Search module
        registerSearchModule(this);

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