'use strict';

class UserBanTransformer {

    /**
     * Transform user ban status data into moderation payload
     * @param {Object} data
     * @returns {Object}
     */
    static transform(data) {
        if (!data) {
            return {
                banned: false,
                banExpiresAt: null
            };
        }

        return {
            banned: Boolean(data.banned),
            banExpiresAt: data.banExpiresAt ? Number(data.banExpiresAt) : null
        };
    }

}

module.exports = UserBanTransformer;
