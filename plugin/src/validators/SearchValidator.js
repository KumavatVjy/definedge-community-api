'use strict';

const ValidationException = require('../exceptions/ValidationException');

class SearchValidator {

    /**
     * Validate search query parameters
     * @param {Object} query
     * @returns {Object}
     */
    static validateSearch(query = {}) {
        const errors = {};

        const q = (typeof query.q === 'string') ? query.q.trim() : '';
        if (!q) {
            errors.q = ['Search query (q) is required.'];
        } else if (q.length < 2) {
            errors.q = ['Search query must be at least 2 characters long.'];
        }

        if (query.limit !== undefined && query.limit !== '') {
            const limit = parseInt(query.limit, 10);
            if (isNaN(limit) || limit <= 0 || limit > 100) {
                errors.limit = ['Limit must be a positive integer between 1 and 100.'];
            }
        }

        if (query.page !== undefined && query.page !== '') {
            const page = parseInt(query.page, 10);
            if (isNaN(page) || page <= 0) {
                errors.page = ['Page must be a positive integer.'];
            }
        }

        const allowedTypes = ['topics', 'posts', 'all'];
        if (query.type !== undefined && query.type !== '' && !allowedTypes.includes(query.type)) {
            errors.type = ['Type must be one of: topics, posts, all.'];
        }

        if (Object.keys(errors).length > 0) {
            throw new ValidationException('Validation failed.', errors);
        }

        const page = parseInt(query.page, 10);
        const limit = parseInt(query.limit, 10);

        return {
            query: q,
            page: (!isNaN(page) && page > 0) ? page : 1,
            limit: (!isNaN(limit) && limit > 0 && limit <= 100) ? limit : 20,
            type: query.type || 'topics'
        };
    }

}

module.exports = SearchValidator;
