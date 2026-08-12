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
                tid: ['Topic ID must be a positive integer.']
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

    /**
     * Validate topic creation payload
     * @param {Object} body
     * @returns {Object}
     */
    static validateCreate(body = {}) {
        const errors = {};

        const cid = parseInt(body.cid, 10);
        if (isNaN(cid) || cid <= 0) {
            errors.cid = ['Category ID is required and must be a positive integer.'];
        }

        const title = (typeof body.title === 'string') ? body.title.trim() : '';
        if (!title) {
            errors.title = ['Title is required.'];
        } else if (title.length < 5 || title.length > 150) {
            errors.title = ['Title must be between 5 and 150 characters.'];
        }

        const content = (typeof body.content === 'string') ? body.content.trim() : '';
        if (!content) {
            errors.content = ['Content is required.'];
        } else if (content.length < 10) {
            errors.content = ['Content must be at least 10 characters long.'];
        }

        if (Object.keys(errors).length > 0) {
            throw new ValidationException('Validation failed.', errors);
        }

        return {
            cid,
            title,
            content
        };
    }

    /**
     * Validate topic reply payload
     * @param {string|number} tid
     * @param {Object} body
     * @returns {Object}
     */
    static validateReply(tid, body = {}) {
        const parsedTid = this.validateTid(tid);
        const errors = {};

        const content = (typeof body.content === 'string') ? body.content.trim() : '';
        if (!content) {
            errors.content = ['Content is required.'];
        } else if (content.length < 10) {
            errors.content = ['Content must be at least 10 characters long.'];
        }

        let toPid;
        if (body.toPid !== undefined && body.toPid !== null) {
            const parsedToPid = parseInt(body.toPid, 10);
            if (isNaN(parsedToPid) || parsedToPid <= 0) {
                errors.toPid = ['Target post ID (toPid) must be a positive integer.'];
            } else {
                toPid = parsedToPid;
            }
        }

        if (Object.keys(errors).length > 0) {
            throw new ValidationException('Validation failed.', errors);
        }

        return {
            tid: parsedTid,
            content,
            toPid
        };
    }

}

module.exports = TopicValidator;
