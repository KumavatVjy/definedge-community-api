'use strict';

const BaseRepository = require('../base/BaseRepository');

class SystemRepository extends BaseRepository {

    async ping() {

        return true;

    }

}

module.exports = SystemRepository;