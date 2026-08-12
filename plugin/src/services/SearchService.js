'use strict';

const BaseService = require('../base/BaseService');
const TopicTransformer = require('../transformers/TopicTransformer');
const PostTransformer = require('../transformers/PostTransformer');

class SearchService extends BaseService {

    constructor(searchRepository, topicRepository = null, postRepository = null, userRepository = null) {
        super(searchRepository);
        this.searchRepository = searchRepository;
        this.topicRepository = topicRepository || new (require('../repositories/NodeBBTopicRepository'))();
        this.postRepository = postRepository || new (require('../repositories/NodeBBPostRepository'))();
        this.userRepository = userRepository || new (require('../repositories/NodeBBUserRepository'))();
    }

    /**
     * Search topics/posts with full batch moderation metadata
     * @param {Object} options
     * @returns {Promise<Object>}
     */
    async search(options = {}) {
        const type = options.type || 'topics';

        if (type === 'all') {
            const [topicsResult, postsResult] = await Promise.all([
                this.search({ ...options, type: 'topics' }),
                this.search({ ...options, type: 'posts' })
            ]);

            return {
                topics: topicsResult.topics,
                posts: postsResult.posts,
                pagination: {
                    total: topicsResult.pagination.total + postsResult.pagination.total,
                    page: options.page || 1,
                    limit: options.limit || 20,
                    totalPages: Math.max(topicsResult.pagination.totalPages, postsResult.pagination.totalPages),
                    hasMore: topicsResult.pagination.hasMore || postsResult.pagination.hasMore
                }
            };
        }

        const result = await this.searchRepository.searchContent(options);
        const rawPosts = result.posts || [];
        const viewerUid = options.uid || 0;

        if (type === 'posts') {
            const pids = rawPosts.map(p => p && p.pid).filter(Boolean);
            const authorUids = [...new Set(rawPosts.map(p => p && (p.uid || (p.user && p.user.uid))).filter(Boolean))];

            const [flagStatuses, banStatuses, deletionStatuses] = await Promise.all([
                pids.length > 0 && this.postRepository
                    ? this.postRepository.getFlagStatuses(pids, viewerUid)
                    : {},
                authorUids.length > 0 && this.userRepository
                    ? this.userRepository.getBanStatuses(authorUids)
                    : {},
                pids.length > 0 && this.postRepository
                    ? this.postRepository.getDeletionStatuses(pids)
                    : {}
            ]);

            const postsWithModeration = rawPosts.map(post => {
                const flagStatus = flagStatuses[post.pid] || {};
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
                        flagged: Boolean(flagStatus.flagged),
                        reportedByMe: Boolean(flagStatus.reportedByMe),
                        flagState: flagStatus.flagState || null
                    }
                };
            });

            return {
                posts: PostTransformer.collection(postsWithModeration),
                pagination: {
                    total: result.total,
                    page: result.page,
                    limit: result.limit,
                    totalPages: result.totalPages,
                    hasMore: result.hasMore
                }
            };
        }

        // Default / 'topics' type: extract topics from rawPosts
        const rawTopics = rawPosts.map(p => p && (p.topic || p)).filter(Boolean);
        const uniqueTopicsMap = new Map();
        rawTopics.forEach(t => {
            if (t && t.tid && !uniqueTopicsMap.has(t.tid)) {
                uniqueTopicsMap.set(t.tid, t);
            }
        });
        const topicsList = Array.from(uniqueTopicsMap.values());

        const mainPids = topicsList.map(t => t && t.mainPid).filter(Boolean);
        const authorUids = [...new Set(topicsList.map(t => t && (t.uid || (t.user && t.user.uid))).filter(Boolean))];
        const topicIds = topicsList.map(t => t && t.tid).filter(Boolean);

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

        const topicsWithModeration = topicsList.map(topic => {
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

        return {
            topics: TopicTransformer.collection(topicsWithModeration),
            pagination: {
                total: result.total,
                page: result.page,
                limit: result.limit,
                totalPages: result.totalPages,
                hasMore: result.hasMore
            }
        };
    }

}

module.exports = SearchService;
