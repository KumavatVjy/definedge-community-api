'use strict';

const ValidationException = require('../exceptions/ValidationException');

class TopicValidator {

    /**
     * Validate topic ID param
     * @param {string|number} tid
     * @returns {number}
     */
    static validateTid(tid) {
        const parsedTid = parseInt(tid, 10);
        if (isNaN(parsedTid) || parsedTid <= 0) {
            throw new ValidationException('Invalid topic ID provided.', {
                tid: 'Topic ID must be a positive integer.'
            });
        }
        return parsedTid;
    }

    /**
     * Validate query options (limit, page)
     * @param {Object} query
     * @returns {Object}
     */
    static validateQuery(query = {}) {
        const page = parseInt(query.page, 10);
        const limit = parseInt(query.limit, 10);

        const validatedPage = (!isNaN(page) && page > 0) ? page : 1;
        const validatedLimit = (!isNaN(limit) && limit > 0 && limit <= 100) ? limit : 20;

        return {
            page: validatedPage,
            limit: validatedLimit
        };
    }

}

module.exports = TopicValidator;
