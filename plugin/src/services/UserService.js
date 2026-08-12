'use strict';

const BaseService = require('../base/BaseService');
const NotFoundException = require('../exceptions/NotFoundException');
const AuthenticationException = require('../exceptions/AuthenticationException');
const AuthorizationException = require('../exceptions/AuthorizationException');
const ApiMessages = require('../constants/ApiMessages');
const Logger = require('../helpers/Logger');
const UserTransformer = require('../transformers/UserTransformer');
const TopicTransformer = require('../transformers/TopicTransformer');
const PostTransformer = require('../transformers/PostTransformer');
const UserStatisticsTransformer = require('../transformers/UserStatisticsTransformer');
const UserActivityTransformer = require('../transformers/UserActivityTransformer');
const UserEngagementTransformer = require('../transformers/UserEngagementTransformer');
const UserBanTransformer = require('../transformers/UserBanTransformer');

class UserService extends BaseService {

    constructor(userRepository, postRepository = null, topicRepository = null) {
        super(userRepository);
        this.userRepository = userRepository;
        this.postRepository = postRepository || new (require('../repositories/NodeBBPostRepository'))();
        this.topicRepository = topicRepository || new (require('../repositories/NodeBBTopicRepository'))();
    }

    /**
     * Get profile of authenticated user
     * @param {number} uid
     * @returns {Promise<Object>}
     */
    async getCurrentUser(uid) {
        if (!uid || uid <= 0) {
            Logger.warn('Unauthenticated request to GET /api/v1/users/me');
            throw new AuthenticationException(ApiMessages.AUTH_REQUIRED_USER_PROFILE);
        }

        const user = await this.userRepository.findById(uid);
        if (!user) {
            Logger.warn(`Authenticated user ${uid} profile not found`);
            throw new NotFoundException(ApiMessages.USER_NOT_FOUND);
        }

        const banStatus = await this.userRepository.getBanStatus(uid);
        user.moderation = UserBanTransformer.transform(banStatus);

        return UserTransformer.transform(user);
    }

    /**
     * Get profile of target user by UID
     * @param {number|string} uid
     * @returns {Promise<Object>}
     */
    async getProfile(uid) {
        const user = await this.userRepository.findById(uid);
        if (!user) {
            Logger.warn(`User profile ${uid} not found`);
            throw new NotFoundException(ApiMessages.USER_NOT_FOUND);
        }

        const banStatus = await this.userRepository.getBanStatus(uid);
        user.moderation = UserBanTransformer.transform(banStatus);

        return UserTransformer.transform(user);
    }

    /**
     * Get topics created by target user
     * @param {Object} params
     * @param {number} params.uid
     * @param {number} [params.page=1]
     * @param {number} [params.limit=20]
     * @returns {Promise<Object>}
     */
    async getTopics({ uid, page = 1, limit = 20, callerUid = 0 }) {
        const result = await this.userRepository.findTopics({
            uid,
            page,
            limit
        });

        const rawTopics = result.topics || [];
        const mainPids = rawTopics.map(t => t && t.mainPid).filter(Boolean);
        const authorUids = [...new Set(rawTopics.map(t => t && (t.uid || (t.user && t.user.uid))).filter(Boolean))];
        const topicIds = rawTopics.map(t => t && t.tid).filter(Boolean);

        const [flagStatuses, banStatuses, deletionStatuses] = await Promise.all([
            mainPids.length > 0 && this.postRepository
                ? this.postRepository.getFlagStatuses(mainPids, callerUid)
                : {},
            authorUids.length > 0
                ? this.userRepository.getBanStatuses(authorUids)
                : {},
            topicIds.length > 0 && this.topicRepository
                ? this.topicRepository.getDeletionStatuses(topicIds)
                : {}
        ]);

        const topicsWithModeration = rawTopics.map(topic => {
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
                page,
                limit,
                hasMore: rawTopics.length === limit
            }
        };
    }

    /**
     * Get posts created by target user
     * @param {Object} params
     * @param {number} params.uid
     * @param {number} [params.page=1]
     * @param {number} [params.limit=20]
     * @returns {Promise<Object>}
     */
    async getPosts({ uid, page = 1, limit = 20, callerUid = 0 }) {
        const result = await this.userRepository.findPosts({
            uid,
            page,
            limit
        });

        const rawPosts = result.posts;
        const pids = (rawPosts || []).map(p => p && p.pid).filter(Boolean);
        const authorUids = [...new Set((rawPosts || []).map(p => p && (p.uid || (p.user && p.user.uid))).filter(Boolean))];

        const [flagStatuses, banStatuses, deletionStatuses] = await Promise.all([
            pids.length > 0 && this.postRepository
                ? this.postRepository.getFlagStatuses(pids, callerUid || 0)
                : {},
            authorUids.length > 0
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

        return {
            posts: PostTransformer.collection(postsWithModeration),
            pagination: {
                page,
                limit,
                hasMore: (rawPosts || []).length === limit
            }
        };
    }

    /**
     * Get followers of target user
     * @param {Object} params
     * @param {number} params.uid
     * @param {number} [params.page=1]
     * @param {number} [params.limit=20]
     * @returns {Promise<Object>}
     */
    async getFollowers({ uid, page = 1, limit = 20 }) {
        const result = await this.userRepository.findFollowers({
            uid,
            page,
            limit
        });

        const rawUsers = result.users || [];
        const uids = rawUsers.map(u => u && u.uid).filter(Boolean);
        const banStatuses = uids.length > 0
            ? await this.userRepository.getBanStatuses(uids)
            : {};

        const usersWithModeration = rawUsers.map(user => {
            const status = banStatuses[user.uid];
            return {
                ...user,
                moderation: UserBanTransformer.transform(status)
            };
        });

        return {
            users: UserTransformer.collection(usersWithModeration),
            pagination: {
                page,
                limit,
                hasMore: rawUsers.length === limit
            }
        };
    }

    /**
     * Get users followed by target user
     * @param {Object} params
     * @param {number} params.uid
     * @param {number} [params.page=1]
     * @param {number} [params.limit=20]
     * @returns {Promise<Object>}
     */
    async getFollowing({ uid, page = 1, limit = 20 }) {
        const result = await this.userRepository.findFollowing({
            uid,
            page,
            limit
        });

        const rawUsers = result.users || [];
        const uids = rawUsers.map(u => u && u.uid).filter(Boolean);
        const banStatuses = uids.length > 0
            ? await this.userRepository.getBanStatuses(uids)
            : {};

        const usersWithModeration = rawUsers.map(user => {
            const status = banStatuses[user.uid];
            return {
                ...user,
                moderation: UserBanTransformer.transform(status)
            };
        });

        return {
            users: UserTransformer.collection(usersWithModeration),
            pagination: {
                page,
                limit,
                hasMore: rawUsers.length === limit
            }
        };
    }

    /**
     * Get statistics of target user by UID
     * @param {number|string} uid
     * @returns {Promise<Object>}
     */
    async getStatistics(uid) {
        const stats = await this.userRepository.findStatistics(uid);
        if (!stats) {
            Logger.warn(`User statistics for ${uid} not found`);
            throw new NotFoundException(ApiMessages.USER_NOT_FOUND);
        }

        return UserStatisticsTransformer.transform(stats);
    }

    /**
     * Get activity feed of target user by UID
     * @param {Object} params
     * @param {number} params.uid
     * @param {number} [params.page=1]
     * @param {number} [params.limit=20]
     * @returns {Promise<Object>}
     */
    async getActivity({ uid, page = 1, limit = 20, callerUid = 0 }) {
        const user = await this.userRepository.findById(uid);
        if (!user) {
            Logger.warn(`User ${uid} not found for activity feed`);
            throw new NotFoundException(ApiMessages.USER_NOT_FOUND);
        }

        const result = await this.userRepository.findActivity({
            uid,
            page,
            limit
        });

        const rawActivities = result.activities || [];
        const postActivities = rawActivities.filter(a => a.type === 'post_created');
        const pids = postActivities.map(a => a.post && a.post.pid).filter(Boolean);
        const authorUids = [...new Set(postActivities.map(a => a.post && (a.post.uid || (a.post.user && a.post.user.uid))).filter(Boolean))];

        const [flagStatuses, banStatuses, deletionStatuses] = await Promise.all([
            pids.length > 0 && this.postRepository
                ? this.postRepository.getFlagStatuses(pids, callerUid || 0)
                : {},
            authorUids.length > 0
                ? this.userRepository.getBanStatuses(authorUids)
                : {},
            pids.length > 0 && this.postRepository
                ? this.postRepository.getDeletionStatuses(pids)
                : {}
        ]);

        const activitiesWithModeration = rawActivities.map(activity => {
            if (activity.type === 'post_created' && activity.post) {
                const status = flagStatuses[activity.post.pid] || {};
                const authorUid = activity.post.uid || (activity.post.user && activity.post.user.uid);
                const banStatus = banStatuses[authorUid] || {};
                const deletionStatus = deletionStatuses[activity.post.pid] || { deleted: activity.post.deleted };

                return {
                    ...activity,
                    post: {
                        ...activity.post,
                        deletion: deletionStatus,
                        user: {
                            ...(activity.post.user || {}),
                            uid: authorUid,
                            moderation: banStatus
                        },
                        moderation: {
                            flagged: Boolean(status.flagged),
                            reportedByMe: Boolean(status.reportedByMe),
                            flagState: status.flagState || null
                        }
                    }
                };
            }
            return activity;
        });

        const transformedActivities = UserActivityTransformer.collection(activitiesWithModeration);

        return {
            activities: transformedActivities,
            pagination: {
                page,
                limit,
                hasMore: result.hasMore
            }
        };
    }

    /**
     * Follow a target user
     * @param {number} uid
     * @param {number} targetUid
     * @returns {Promise<Object>}
     */
    async followUser(uid, targetUid) {
        if (!uid || uid <= 0) {
            Logger.warn(`Unauthenticated follow attempt on target user ${targetUid}`);
            throw new AuthenticationException(ApiMessages.AUTH_REQUIRED_USER_FOLLOW);
        }

        const numericTargetUid = parseInt(targetUid, 10);

        if (Number(uid) === numericTargetUid) {
            Logger.warn(`User ${uid} attempted to follow themselves`);
            throw new AuthorizationException(ApiMessages.SELF_FOLLOW_FORBIDDEN);
        }

        const targetUser = await this.userRepository.findById(numericTargetUid);
        if (!targetUser) {
            Logger.warn(`Follow failed: target user ${targetUid} not found`);
            throw new NotFoundException(ApiMessages.USER_NOT_FOUND);
        }

        const currentlyFollowing = await this.userRepository.isFollowing(uid, numericTargetUid);
        if (currentlyFollowing) {
            return {
                uid: parseInt(uid, 10),
                targetUid: numericTargetUid,
                following: true
            };
        }

        try {
            await this.userRepository.follow(uid, numericTargetUid);
            Logger.info(`User ${uid} followed user ${numericTargetUid}`);
        } catch (err) {
            if (err.message && (err.message.includes('cant-follow-self') || err.message.includes('self-follow'))) {
                throw new AuthorizationException(ApiMessages.SELF_FOLLOW_FORBIDDEN);
            }
            if (err.message && err.message.includes('already-following')) {
                return {
                    uid: parseInt(uid, 10),
                    targetUid: numericTargetUid,
                    following: true
                };
            }
            throw err;
        }

        return {
            uid: parseInt(uid, 10),
            targetUid: numericTargetUid,
            following: true
        };
    }

    /**
     * Unfollow a target user (idempotent: ensures user is not following target)
     * @param {number} uid
     * @param {number} targetUid
     * @returns {Promise<Object>}
     */
    async unfollowUser(uid, targetUid) {
        if (!uid || uid <= 0) {
            Logger.warn(`Unauthenticated unfollow attempt on target user ${targetUid}`);
            throw new AuthenticationException(ApiMessages.AUTH_REQUIRED_USER_FOLLOW);
        }

        const numericTargetUid = parseInt(targetUid, 10);

        if (Number(uid) === numericTargetUid) {
            Logger.warn(`User ${uid} attempted to unfollow themselves`);
            throw new AuthorizationException(ApiMessages.SELF_FOLLOW_FORBIDDEN);
        }

        const targetUser = await this.userRepository.findById(numericTargetUid);
        if (!targetUser) {
            Logger.warn(`Unfollow failed: target user ${targetUid} not found`);
            throw new NotFoundException(ApiMessages.USER_NOT_FOUND);
        }

        const currentlyFollowing = await this.userRepository.isFollowing(uid, numericTargetUid);
        if (!currentlyFollowing) {
            return {
                uid: parseInt(uid, 10),
                targetUid: numericTargetUid,
                following: false
            };
        }

        try {
            await this.userRepository.unfollow(uid, numericTargetUid);
            Logger.info(`User ${uid} unfollowed user ${numericTargetUid}`);
        } catch (err) {
            if (err.message && (err.message.includes('cant-unfollow-self') || err.message.includes('self-follow'))) {
                throw new AuthorizationException(ApiMessages.SELF_FOLLOW_FORBIDDEN);
            }
            if (err.message && (err.message.includes('not-following') || err.message.includes('already-unfollowed'))) {
                return {
                    uid: parseInt(uid, 10),
                    targetUid: numericTargetUid,
                    following: false
                };
            }
            throw err;
        }

        return {
            uid: parseInt(uid, 10),
            targetUid: numericTargetUid,
            following: false
        };
    }

    /**
     * Get follow status for a target user
     * @param {number} uid
     * @param {number} targetUid
     * @returns {Promise<Object>}
     */
    async getFollowingStatus(uid, targetUid) {
        if (!uid || uid <= 0) {
            Logger.warn(`Unauthenticated follow status check on target user ${targetUid}`);
            throw new AuthenticationException(ApiMessages.AUTH_REQUIRED_USER_FOLLOW);
        }

        const numericTargetUid = parseInt(targetUid, 10);

        const targetUser = await this.userRepository.findById(numericTargetUid);
        if (!targetUser) {
            Logger.warn(`Follow status check failed: target user ${targetUid} not found`);
            throw new NotFoundException(ApiMessages.USER_NOT_FOUND);
        }

        const following = await this.userRepository.isFollowing(uid, numericTargetUid);

        return {
            uid: parseInt(uid, 10),
            targetUid: numericTargetUid,
            following: Boolean(following)
        };
    }

    /**
     * Get engagement statistics for a user
     * @param {number|string} uid
     * @returns {Promise<Object>}
     */
    async getEngagement(uid) {
        const numericUid = parseInt(uid, 10);

        if (isNaN(numericUid) || numericUid <= 0) {
            throw new NotFoundException(
                ApiMessages.USER_NOT_FOUND
            );
        }

        const user = await this.userRepository.findById(numericUid);

        if (!user) {
            Logger.warn(
                `User engagement ${numericUid} requested for non-existent user`
            );

            throw new NotFoundException(
                ApiMessages.USER_NOT_FOUND
            );
        }

        const engagement = await this.userRepository.findEngagement(numericUid);

        return UserEngagementTransformer.transform(engagement);
    }

}

module.exports = UserService;


