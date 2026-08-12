'use strict';

class PostFlagTransformer {

    /**
     * Transform post flag status data into public API payload
     * @param {Object} data
     * @returns {Object|null}
     */
    static transform(data) {
        if (!data) {
            return null;
        }

        return {
            pid: Number(data.pid),
            moderation: {
                flagged: Boolean(data.flagged),
                reportedByMe: Boolean(data.reportedByMe),
                flagState: data.flagState || null
            }
        };
    }

}

module.exports = PostFlagTransformer;
