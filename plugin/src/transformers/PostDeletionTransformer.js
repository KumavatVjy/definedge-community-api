'use strict';

class PostDeletionTransformer {

    /**
     * Transform post deletion data into public API payload
     * @param {Object} data
     * @returns {Object}
     */
    static transform(data) {
        if (!data) {
            return {
                deleted: false
            };
        }

        return {
            deleted: Boolean(data.deleted)
        };
    }

}

module.exports = PostDeletionTransformer;
