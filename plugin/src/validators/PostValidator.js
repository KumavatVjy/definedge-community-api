'use strict';

const ValidationException = require('../exceptions/ValidationException');

class PostValidator {

    /**
     * Validate post ID param
     * @param {string|number} pid
     * @returns {number}
     */
    static validatePid(pid) {
        const parsedPid = parseInt(pid, 10);
        if (isNaN(parsedPid) || parsedPid <= 0) {
            throw new ValidationException('Invalid post ID provided.', {
                pid: ['Post ID must be a positive integer.']
            });
        }
        return parsedPid;
    }

    /**
     * Validate post edit payload
     * @param {string|number} pid
     * @param {Object} body
     * @returns {Object}
     */
    static validateEdit(pid, body = {}) {
        const parsedPid = this.validatePid(pid);
        const errors = {};

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
            pid: parsedPid,
            content,
            title: (typeof body.title === 'string') ? body.title.trim() : undefined,
            tags: Array.isArray(body.tags) ? body.tags : undefined
        };
    }

}

module.exports = PostValidator;
