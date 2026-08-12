'use strict';

const ValidationException = require('../exceptions/ValidationException');

class UserValidator {

    /**
     * Validate user ID param (throws ValidationException if invalid)
     * @param {string|number} uid
     * @returns {number}
     */
    static validateUid(uid) {
        const parsedUid = parseInt(uid, 10);
        if (isNaN(parsedUid) || parsedUid <= 0) {
            throw new ValidationException('Invalid user ID provided.', {
                uid: ['User ID must be a positive integer.']
            });
        }
        return parsedUid;
    }

    /**
     * Validate user ID in route params object
     * @param {Object} params
     * @returns {Object} errors
     */
    static validateUidParam(params = {}) {
        const errors = {};
        const uid = Number(params.uid);

        if (!Number.isInteger(uid) || uid <= 0) {
            errors.uid = ['User ID must be a positive integer.'];
        }

        return errors;
    }

    /**
     * Validate pagination query parameters (page & limit)
     * @param {Object} query
     * @returns {Object} errors
     */
    static validatePagination(query = {}) {
        const errors = {};

        const page = Number(query.page || 1);
        const limit = Number(query.limit || 20);

        if (!Number.isInteger(page) || page <= 0) {
            errors.page = ['Page must be a positive integer.'];
        }

        if (!Number.isInteger(limit) || limit <= 0 || limit > 100) {
            errors.limit = ['Limit must be between 1 and 100.'];
        }

        return errors;
    }

    /**
     * Validate params and query for user topics request
     * @param {Object} params
     * @param {Object} query
     * @returns {Object} errors
     */
    static validateTopics(params = {}, query = {}) {
        return {
            ...this.validateUidParam(params),
            ...this.validatePagination(query)
        };
    }

    /**
     * Validate params and query for user posts request
     * @param {Object} params
     * @param {Object} query
     * @returns {Object} errors
     */
    static validatePosts(params = {}, query = {}) {
        return {
            ...this.validateUidParam(params),
            ...this.validatePagination(query)
        };
    }

    /**
     * Validate params and query for user followers request
     * @param {Object} params
     * @param {Object} query
     * @returns {Object} errors
     */
    static validateFollowers(params = {}, query = {}) {
        return {
            ...this.validateUidParam(params),
            ...this.validatePagination(query)
        };
    }

    /**
     * Validate params and query for user following request
     * @param {Object} params
     * @param {Object} query
     * @returns {Object} errors
     */
    static validateFollowing(params = {}, query = {}) {
        return {
            ...this.validateUidParam(params),
            ...this.validatePagination(query)
        };
    }

    /**
     * Validate params and query for user activity request
     * @param {Object} params
     * @param {Object} query
     * @returns {Object} errors
     */
    static validateActivity(params = {}, query = {}) {
        return {
            ...this.validateUidParam(params),
            ...this.validatePagination(query)
        };
    }

}

module.exports = UserValidator;

