'use strict';

const BaseService = require('../base/BaseService');
const NotFoundException = require('../exceptions/NotFoundException');
const AuthenticationException = require('../exceptions/AuthenticationException');
const ApiMessages = require('../constants/ApiMessages');
const Logger = require('../helpers/Logger');
const TopicTransformer = require('../transformers/TopicTransformer');
const PostTransformer = require('../transformers/PostTransformer');

class TopicService extends BaseService {

    constructor(topicRepository, categoryRepository = null, postRepository = null, userRepository = null) {
        super(topicRepository);
        this.topicRepository = topicRepository;
        this.categoryRepository = categoryRepository;
        this.postRepository = postRepository || new (require('../repositories/NodeBBPostRepository'))();
        this.userRepository = userRepository || new (require('../repositories/NodeBBUserRepository'))();
    }

    /**
     * Create a topic
     * @param {Object} payload
     * @param {number} payload.cid
     * @param {string} payload.title
     * @param {string} payload.content
     * @param {number} payload.uid
     * @returns {Promise<Object>}
     */
    async createTopic(payload = {}) {
        const { cid, title, content, uid } = payload;

        if (!uid || uid <= 0) {
            Logger.warn(`Unauthenticated topic creation attempt in category ${cid}`);
            throw new AuthenticationException(ApiMessages.AUTH_REQUIRED_TOPIC_CREATE);
        }

        if (this.categoryRepository) {
            const category = await this.categoryRepository.findById(cid, { uid });
            if (!category) {
                Logger.warn(`Topic creation failed: category ${cid} not found`);
                throw new NotFoundException(ApiMessages.CATEGORY_NOT_FOUND);
            }
        }

        const result = await this.topicRepository.createTopic({
            cid,
            title,
            content,
            uid
        });

        Logger.info(`Topic ${result.tid} created successfully in category ${cid} by user ${uid}`);
        return result;
    }

    /**
     * Reply to a topic
     * @param {Object} payload
     * @param {number} payload.tid
     * @param {string} payload.content
     * @param {number} payload.uid
     * @param {number} [payload.toPid]
     * @returns {Promise<Object>}
     */
    async replyToTopic(payload = {}) {
        const { tid, content, uid, toPid } = payload;

        if (!uid || uid <= 0) {
            Logger.warn(`Unauthenticated topic reply attempt on topic ${tid}`);
            throw new AuthenticationException(ApiMessages.AUTH_REQUIRED_TOPIC_REPLY);
        }

        const topic = await this.topicRepository.findById(tid, { uid });
        if (!topic) {
            Logger.warn(`Topic reply failed: topic ${tid} not found`);
            throw new NotFoundException(ApiMessages.TOPIC_NOT_FOUND);
        }

        const postData = await this.topicRepository.replyToTopic({
            tid,
            content,
            uid,
            toPid
        });

        Logger.info(`Reply post ${postData.pid} created successfully on topic ${tid} by user ${uid}`);
        return PostTransformer.transform(postData);
    }

    /**
     * Attach mainPid moderation metadata to topic objects in batch
     * @param {Array<Object>} topics
     * @param {number} viewerUid
     * @returns {Promise<Array<Object>>}
     */
    async attachModerationToTopics(topics = [], viewerUid = 0) {
        if (!Array.isArray(topics) || !topics.length) {
            return [];
        }

        const mainPids = topics.map(t => t && t.mainPid).filter(Boolean);
        const authorUids = [...new Set(topics.map(t => t && (t.uid || (t.user && t.user.uid))).filter(Boolean))];
        const topicIds = topics.map(t => t && t.tid).filter(Boolean);

        const [flagStatuses, banStatuses, deletionStatuses] = await Promise.all([
            mainPids.length > 0 && this.postRepository
                ? this.postRepository.getFlagStatuses(mainPids, viewerUid)
                : {},
            authorUids.length > 0 && this.userRepository
                ? this.userRepository.getBanStatuses(authorUids)
                : {},
            topicIds.length > 0 && this.topicRepository
                ? this.topicRepository.getDeletionStatuses(topicIds)
                : {}
        ]);

        return topics.map(topic => {
            const flagStatus = flagStatuses[topic.mainPid] || {};
            const authorUid = topic.uid || (topic.user && topic.user.uid);
            const banStatus = banStatuses[authorUid] || {};
            const deletionStatus = deletionStatuses[topic.tid] || {
                deleted: Boolean(topic.deleted),
                deletedTimestamp: topic.deletedTimestamp || null
            };

            return {
                ...topic,
                deletion: deletionStatus,
                user: {
                    ...(topic.user || {}),
                    uid: authorUid,
                    moderation: banStatus
                },
                moderation: {
                    flagged: Boolean(flagStatus.flagged),
                    reportedByMe: Boolean(flagStatus.reportedByMe),
                    flagState: flagStatus.flagState || null
                }
            };
        });
    }

    /**
     * Get latest topics list
     * @param {Object} options
     * @returns {Promise<Array>}
     */
    async latest(options = {}) {
        const page = options.page || 1;
        const limit = options.limit || 20;

        const rawTopics = await this.topicRepository.findLatest({ ...options, page, limit: limit + 1 });
        const hasMore = rawTopics.length > limit;
        const slicedTopics = hasMore ? rawTopics.slice(0, limit) : rawTopics;

        const topicsWithMod = await this.attachModerationToTopics(slicedTopics, options.uid || 0);

        return {
            topics: TopicTransformer.collection(topicsWithMod),
            pagination: {
                page,
                limit,
                hasMore
            }
        };
    }

    /**
     * Get popular topics list
     * @param {Object} options
     * @returns {Promise<Object>}
     */
    async popular(options = {}) {
        const page = options.page || 1;
        const limit = options.limit || 20;

        const rawTopics = await this.topicRepository.findPopular({ ...options, page, limit: limit + 1 });
        const hasMore = rawTopics.length > limit;
        const slicedTopics = hasMore ? rawTopics.slice(0, limit) : rawTopics;

        const topicsWithMod = await this.attachModerationToTopics(slicedTopics, options.uid || 0);

        return {
            topics: TopicTransformer.collection(topicsWithMod),
            pagination: {
                page,
                limit,
                hasMore
            }
        };
    }

    /**
     * Get single topic details by TID
     * @param {number|string} tid
     * @param {Object} options
     * @returns {Promise<Object>}
     */
    async getTopicById(tid, options = {}) {
        const topic = await this.topicRepository.findById(tid, options);
        if (!topic) {
            throw new NotFoundException(ApiMessages.TOPIC_NOT_FOUND);
        }

        const [topicWithMod] = await this.attachModerationToTopics([topic], options.uid || 0);

        return TopicTransformer.transform(topicWithMod);
    }

    /**
     * Get topic posts with pagination
     * @param {number|string} tid
     * @param {Object} options
     * @returns {Promise<Object>}
     */
    async getTopicPosts(tid, options = {}) {
        const topic = await this.topicRepository.findById(tid, options);
        if (!topic) {
            throw new NotFoundException(ApiMessages.TOPIC_NOT_FOUND);
        }

        const page = options.page || 1;
        const limit = options.limit || 20;

        const rawPosts = await this.topicRepository.findPosts(tid, {
            page,
            limit,
            uid: options.uid || 0
        });

        const pids = (rawPosts || []).map(p => p && p.pid).filter(Boolean);
        const authorUids = [...new Set((rawPosts || []).map(p => p && (p.uid || (p.user && p.user.uid))).filter(Boolean))];

        const [flagStatuses, banStatuses, deletionStatuses] = await Promise.all([
            pids.length > 0 && this.postRepository
                ? this.postRepository.getFlagStatuses(pids, options.uid || 0)
                : {},
            authorUids.length > 0 && this.userRepository
                ? this.userRepository.getBanStatuses(authorUids)
                : {},
            pids.length > 0 && this.postRepository
                ? this.postRepository.getDeletionStatuses(pids)
                : {}
        ]);

        const postsWithModeration = (rawPosts || []).map(post => {
            const status = flagStatuses[post.pid] || {};
            const authorUid = post.uid || (post.user && post.user.uid);
            const banStatus = banStatuses[authorUid] || {};
            const deletionStatus = deletionStatuses[post.pid] || { deleted: post.deleted };

            return {
                ...post,
                deletion: deletionStatus,
                user: {
                    ...(post.user || {}),
                    uid: authorUid,
                    moderation: banStatus
                },
                moderation: {
                    flagged: Boolean(status.flagged),
                    reportedByMe: Boolean(status.reportedByMe),
                    flagState: status.flagState || null
                }
            };
        });

        const posts = PostTransformer.collection(postsWithModeration);
        const total = topic.postcount || 0;
        const totalPages = Math.ceil(total / limit) || 1;

        return {
            tid: parseInt(tid, 10),
            posts,
            pagination: {
                total,
                page,
                limit,
                totalPages,
                hasMore: page < totalPages
            }
        };
    }

    /**
     * Watch a topic
     * @param {number} uid
     * @param {number} tid
     * @returns {Promise<Object>}
     */
    async watchTopic(uid, tid) {
        const numericTid = Number(tid);

        if (!uid || uid <= 0) {
            Logger.warn(`Unauthenticated watch attempt on topic ${tid}`);
            throw new AuthenticationException(ApiMessages.AUTH_REQUIRED_TOPIC_WATCH);
        }

        const topic = await this.topicRepository.findById(numericTid, { uid });
        if (!topic) {
            Logger.warn(`Watch topic failed: topic ${tid} not found`);
            throw new NotFoundException(ApiMessages.TOPIC_NOT_FOUND);
        }

        const watching = await this.topicRepository.isWatching(numericTid, uid);
        if (watching) {
            return {
                tid: numericTid,
                watching: true
            };
        }

        await this.topicRepository.watch(numericTid, uid);
        Logger.info(`User ${uid} watched topic ${numericTid}`);

        return {
            tid: numericTid,
            watching: true
        };
    }

    /**
     * Unwatch a topic
     * @param {number} uid
     * @param {number} tid
     * @returns {Promise<Object>}
     */
    async unwatchTopic(uid, tid) {
        const numericTid = Number(tid);

        if (!uid || uid <= 0) {
            Logger.warn(`Unauthenticated unwatch attempt on topic ${tid}`);
            throw new AuthenticationException(ApiMessages.AUTH_REQUIRED_TOPIC_WATCH);
        }

        const topic = await this.topicRepository.findById(numericTid, { uid });
        if (!topic) {
            Logger.warn(`Unwatch topic failed: topic ${tid} not found`);
            throw new NotFoundException(ApiMessages.TOPIC_NOT_FOUND);
        }

        const watching = await this.topicRepository.isWatching(numericTid, uid);
        if (!watching) {
            return {
                tid: numericTid,
                watching: false
            };
        }

        await this.topicRepository.unwatch(numericTid, uid);
        Logger.info(`User ${uid} unwatched topic ${numericTid}`);

        return {
            tid: numericTid,
            watching: false
        };
    }

    /**
     * Get watch status for a topic
     * @param {number} uid
     * @param {number} tid
     * @returns {Promise<Object>}
     */
    async getWatchStatus(uid, tid) {
        const numericTid = Number(tid);

        if (!uid || uid <= 0) {
            Logger.warn(`Unauthenticated watch status check on topic ${tid}`);
            throw new AuthenticationException(ApiMessages.AUTH_REQUIRED_TOPIC_WATCH);
        }

        const topic = await this.topicRepository.findById(numericTid, { uid });
        if (!topic) {
            Logger.warn(`Watch status failed: topic ${tid} not found`);
            throw new NotFoundException(ApiMessages.TOPIC_NOT_FOUND);
        }

        const watching = await this.topicRepository.isWatching(numericTid, uid);

        return {
            tid: numericTid,
            watching
        };
    }

}

module.exports = TopicService;
