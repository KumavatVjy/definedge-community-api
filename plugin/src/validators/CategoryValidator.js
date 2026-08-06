'use strict';

const ValidationException = require('../exceptions/ValidationException');

class CategoryValidator {

    /**
     * Validate category ID param
     * @param {string|number} cid
     * @returns {number}
     */
    static validateCid(cid) {
        const parsedCid = parseInt(cid, 10);
        if (isNaN(parsedCid) || parsedCid <= 0) {
            throw new ValidationException('Invalid category ID provided.', {
                cid: 'Category ID must be a positive integer.'
            });
        }
        return parsedCid;
    }

    /**
     * Validate pagination query parameters
     * @param {Object} query
     * @returns {Object}
     */
    static validatePagination(query = {}) {
        const page = parseInt(query.page, 10);
        const limit = parseInt(query.limit, 10);

        const validatedPage = (!isNaN(page) && page > 0) ? page : 1;
        const validatedLimit = (!isNaN(limit) && limit > 0 && limit <= 100) ? limit : 20;

        return {
            page: validatedPage,
            limit: validatedLimit,
            sort: query.sort || 'newest_to_oldest'
        };
    }

}

module.exports = CategoryValidator;
