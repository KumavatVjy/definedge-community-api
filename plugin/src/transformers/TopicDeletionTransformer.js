'use strict';

class TopicDeletionTransformer {

    /**
     * Transform topic deletion data into public API payload
     * @param {Object} data
     * @returns {Object}
     */
    static transform(data) {
        if (!data) {
            return {
                deleted: false,
                deletedAt: null
            };
        }

        const isDeleted = Boolean(data.deleted);
        const timestamp = data.deletedTimestamp ? Number(data.deletedTimestamp) : null;

        return {
            deleted: isDeleted,
            deletedAt: isDeleted && timestamp ? new Date(timestamp).toISOString() : null
        };
    }

}

module.exports = TopicDeletionTransformer;
