'use strict';

const TopicTransformer = require('./TopicTransformer');
const PostTransformer = require('./PostTransformer');

class UserActivityTransformer {

    /**
     * Transform single activity item
     * @param {Object} item
     * @returns {Object|null}
     */
    static transformItem(item) {
        if (!item) return null;

        if (item.type === 'topic_created' || item.tid) {
            const rawTopic = item.topic || item;
            const timestamp = item.timestamp || rawTopic.timestamp || 0;

            return {
                type: 'topic_created',
                timestamp: typeof timestamp === 'number' ? timestamp : new Date(timestamp).getTime(),
                topic: TopicTransformer.transform(rawTopic)
            };
        }

        if (item.type === 'post_created' || item.pid) {
            const rawPost = item.post || item;
            const timestamp = item.timestamp || rawPost.timestamp || 0;

            return {
                type: 'post_created',
                timestamp: typeof timestamp === 'number' ? timestamp : new Date(timestamp).getTime(),
                post: PostTransformer.transform(rawPost)
            };
        }

        return item;
    }

    /**
     * Transform array of activity items
     * @param {Array} items
     * @returns {Array}
     */
    static collection(items) {
        if (!Array.isArray(items)) return [];
        return items.map(item => this.transformItem(item)).filter(Boolean);
    }

}

module.exports = UserActivityTransformer;
