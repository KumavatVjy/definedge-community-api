'use strict';

const Application = require('./src/bootstrap/Application');

const Plugin = {};

Plugin.init = async (params) => {

	await Application.start(params);

};

module.exports = Plugin;