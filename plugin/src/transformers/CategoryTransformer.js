'use strict';

const TopicTransformer = require('./TopicTransformer');

class CategoryTransformer {

    /**
     * Transform single category object
     * @param {Object} category
     * @returns {Object}
     */
    static transform(category) {
        if (!category) return null;

        return {
            id: category.cid,
            name: category.name,
            slug: category.slug,
            description: category.description || '',
            icon: category.icon || 'fa-comments',
            color: category.color || '#ffffff',
            backgroundColor: category.bgColor || '#000000',
            topics: category.topic_count || 0,
            posts: category.post_count || 0,
            disabled: Boolean(category.disabled),
            isSection: Boolean(category.isSection),
            parentCid: category.parentCid || 0,
            order: category.order || 0
        };
    }

    /**
     * Transform array of category objects
     * @param {Array} categories
     * @returns {Array}
     */
    static collection(categories) {
        if (!Array.isArray(categories)) return [];
        return categories.map(category => this.transform(category));
    }

    /**
     * Transform category details object (includes topics and parent)
     * @param {Object} category
     * @returns {Object}
     */
    static transformDetails(category) {
        if (!category) return null;

        const base = this.transform(category);

        base.topicsList = TopicTransformer.collection(category.topics);
        base.parent = category.parent ? this.transform(category.parent) : null;
        base.isWatched = Boolean(category.isWatched);
        base.isIgnored = Boolean(category.isIgnored);

        return base;
    }

    /**
     * Transform category statistics object
     * @param {Object} stats
     * @returns {Object}
     */
    static transformStats(stats) {
        if (!stats) return null;

        const { categoryData, activeUsers } = stats;

        return {
            id: parseInt(categoryData.cid, 10),
            name: categoryData.name || '',
            topics: parseInt(categoryData.topic_count, 10) || 0,
            posts: parseInt(categoryData.post_count, 10) || 0,
            activeUsers: Array.isArray(activeUsers) ? activeUsers.length : 0,
            disabled: Boolean(categoryData.disabled)
        };
    }

}

module.exports = CategoryTransformer;
