'use strict';

const BaseService = require('../base/BaseService');
const NotFoundException = require('../exceptions/NotFoundException');
const AuthenticationException = require('../exceptions/AuthenticationException');
const AuthorizationException = require('../exceptions/AuthorizationException');
const ValidationException = require('../exceptions/ValidationException');
const ApiMessages = require('../constants/ApiMessages');
const Logger = require('../helpers/Logger');
const PostTransformer = require('../transformers/PostTransformer');
const PostLikeTransformer = require('../transformers/PostLikeTransformer');
const PostBookmarkTransformer = require('../transformers/PostBookmarkTransformer');
const PostFlagTransformer = require('../transformers/PostFlagTransformer');

class PostService extends BaseService {

    constructor(postRepository) {
        super(postRepository);
        this.postRepository = postRepository;
    }

    /**
     * Edit a post
     * @param {Object} payload
     * @param {number} payload.pid
     * @param {string} payload.content
     * @param {number} payload.uid
     * @param {string} [payload.title]
     * @param {Array} [payload.tags]
     * @returns {Promise<Object>}
     */
    async editPost(payload = {}) {
        const { pid, content, uid, title, tags } = payload;

        if (!uid || uid <= 0) {
            Logger.warn(`Unauthenticated post edit attempt on post ${pid}`);
            throw new AuthenticationException(ApiMessages.AUTH_REQUIRED_POST_EDIT);
        }

        const existingPost = await this.postRepository.findById(pid, { uid });
        if (!existingPost) {
            Logger.warn(`Post edit failed: post ${pid} not found`);
            throw new NotFoundException(ApiMessages.POST_NOT_FOUND);
        }

        const editResult = await this.postRepository.editPost({
            pid,
            content,
            uid,
            title,
            tags
        });

        Logger.info(`Post ${pid} updated successfully by user ${uid}`);

        const updatedPost = await this.postRepository.findById(pid, { uid });
        return PostTransformer.transform(updatedPost || editResult.post || existingPost);
    }

    /**
     * Delete a post
     * @param {Object} payload
     * @param {number} payload.pid
     * @param {number} payload.uid
     * @returns {Promise<Object>}
     */
    async deletePost(payload = {}) {
        const { pid, uid } = payload;

        if (!uid || uid <= 0) {
            Logger.warn(`Unauthenticated post delete attempt on post ${pid}`);
            throw new AuthenticationException(ApiMessages.AUTH_REQUIRED_POST_DELETE);
        }

        const existingPost = await this.postRepository.findById(pid, { uid });
        if (!existingPost) {
            Logger.warn(`Post deletion failed: post ${pid} not found`);
            throw new NotFoundException(ApiMessages.POST_NOT_FOUND);
        }

        await this.postRepository.deletePost({ pid, uid });

        Logger.info(`Post ${pid} deleted successfully by user ${uid}`);

        return {
            id: parseInt(pid, 10),
            deleted: true
        };
    }

    /**
     * Restore a soft-deleted post
     * @param {Object} payload
     * @param {number} payload.pid
     * @param {number} payload.uid
     * @returns {Promise<Object>}
     */
    async restorePost(payload = {}) {
        const { pid, uid } = payload;

        if (!uid || uid <= 0) {
            Logger.warn(`Unauthenticated post restore attempt on post ${pid}`);
            throw new AuthenticationException(ApiMessages.AUTH_REQUIRED_POST_RESTORE);
        }

        const existingPost = await this.postRepository.findById(pid, { uid });
        if (!existingPost) {
            Logger.warn(`Post restore failed: post ${pid} not found`);
            throw new NotFoundException(ApiMessages.POST_NOT_FOUND);
        }

        await this.postRepository.restorePost({ pid, uid });

        Logger.info(`Post ${pid} restored successfully by user ${uid}`);

        return {
            id: parseInt(pid, 10),
            deleted: false
        };
    }

    /**
     * Like a post (idempotent: ensures post becomes/remains liked)
     * @param {Object} payload
     * @param {number} payload.pid
     * @param {number} payload.uid
     * @returns {Promise<Object>}
     */
    async likePost(payload = {}) {
        const { pid, uid } = payload;

        if (!uid || uid <= 0) {
            Logger.warn(`Unauthenticated post like attempt on post ${pid}`);
            throw new AuthenticationException(ApiMessages.AUTH_REQUIRED_POST_LIKE);
        }

        const existingPost = await this.postRepository.findById(pid, { uid });
        if (!existingPost) {
            Logger.warn(`Post like failed: post ${pid} not found`);
            throw new NotFoundException(ApiMessages.POST_NOT_FOUND);
        }

        if (Number(existingPost.uid) === Number(uid)) {
            Logger.warn(`User ${uid} attempted to vote on their own post ${pid}`);
            throw new AuthorizationException(ApiMessages.SELF_VOTE_FORBIDDEN);
        }

        const voteStatus = await this.postRepository.getLikeStatus(pid, uid);
        if (voteStatus && voteStatus.upvoted) {
            const upvotes = existingPost.upvotes || 0;
            const downvotes = existingPost.downvotes || 0;
            return {
                pid: parseInt(pid, 10),
                liked: true,
                upvotes,
                downvotes,
                votes: upvotes - downvotes
            };
        }

        try {
            const result = await this.postRepository.like(pid, uid);
            Logger.info(`Post ${pid} liked by user ${uid}`);
            return PostLikeTransformer.transform({ ...result, pid: parseInt(pid, 10) });
        } catch (err) {
            if (err.message && (err.message.includes('self-vote') || err.message.includes('cant-vote-own-post'))) {
                throw new AuthorizationException(ApiMessages.SELF_VOTE_FORBIDDEN);
            }
            throw err;
        }
    }

    /**
     * Unlike a post (idempotent: ensures upvote is removed if present, preserves downvotes)
     * @param {Object} payload
     * @param {number} payload.pid
     * @param {number} payload.uid
     * @returns {Promise<Object>}
     */
    async unlikePost(payload = {}) {
        const { pid, uid } = payload;

        if (!uid || uid <= 0) {
            Logger.warn(`Unauthenticated post unlike attempt on post ${pid}`);
            throw new AuthenticationException(ApiMessages.AUTH_REQUIRED_POST_LIKE);
        }

        const existingPost = await this.postRepository.findById(pid, { uid });
        if (!existingPost) {
            Logger.warn(`Post unlike failed: post ${pid} not found`);
            throw new NotFoundException(ApiMessages.POST_NOT_FOUND);
        }

        if (Number(existingPost.uid) === Number(uid)) {
            Logger.warn(`User ${uid} attempted to unvote their own post ${pid}`);
            throw new AuthorizationException(ApiMessages.SELF_VOTE_FORBIDDEN);
        }

        const voteStatus = await this.postRepository.getLikeStatus(pid, uid);
        if (!voteStatus || !voteStatus.upvoted) {
            const upvotes = existingPost.upvotes || 0;
            const downvotes = existingPost.downvotes || 0;
            return {
                pid: parseInt(pid, 10),
                liked: false,
                upvotes,
                downvotes,
                votes: upvotes - downvotes
            };
        }

        try {
            const result = await this.postRepository.unlike(pid, uid);
            Logger.info(`Post ${pid} unliked by user ${uid}`);
            return PostLikeTransformer.transform({ ...result, pid: parseInt(pid, 10) });
        } catch (err) {
            if (err.message && (err.message.includes('self-vote') || err.message.includes('cant-vote-own-post'))) {
                throw new AuthorizationException(ApiMessages.SELF_VOTE_FORBIDDEN);
            }
            throw err;
        }
    }

    /**
     * Get like status for a post
     * @param {Object} payload
     * @param {number} payload.pid
     * @param {number} payload.uid
     * @returns {Promise<Object>}
     */
    async getLikeStatus(payload = {}) {
        const { pid, uid } = payload;

        if (!uid || uid <= 0) {
            Logger.warn(`Unauthenticated post like status check on post ${pid}`);
            throw new AuthenticationException(ApiMessages.AUTH_REQUIRED_POST_LIKE);
        }

        const existingPost = await this.postRepository.findById(pid, { uid });
        if (!existingPost) {
            Logger.warn(`Post like status failed: post ${pid} not found`);
            throw new NotFoundException(ApiMessages.POST_NOT_FOUND);
        }

        const result = await this.postRepository.getLikeStatus(pid, uid);

        return {
            pid: parseInt(pid, 10),
            liked: Boolean(result && result.upvoted)
        };
    }

    /**
     * Bookmark a post
     * @param {Object} payload
     * @param {number} payload.pid
     * @param {number} payload.uid
     * @returns {Promise<Object>}
     */
    async bookmarkPost(payload = {}) {
        const { pid, uid } = payload;

        if (!uid || uid <= 0) {
            Logger.warn(`Unauthenticated post bookmark attempt on post ${pid}`);
            throw new AuthenticationException(ApiMessages.AUTH_REQUIRED_POST_BOOKMARK);
        }

        const existingPost = await this.postRepository.findById(pid, { uid });
        if (!existingPost) {
            Logger.warn(`Post bookmark failed: post ${pid} not found`);
            throw new NotFoundException(ApiMessages.POST_NOT_FOUND);
        }

        try {
            const result = await this.postRepository.bookmark(pid, uid);
            Logger.info(`Post ${pid} bookmarked by user ${uid}`);
            return PostBookmarkTransformer.transform({ ...result, pid: parseInt(pid, 10) });
        } catch (err) {
            if (err.message && err.message.includes('already-bookmarked')) {
                const currentPost = await this.postRepository.findById(pid, { uid });
                return PostBookmarkTransformer.transform({
                    post: currentPost || existingPost,
                    isBookmarked: true,
                    pid: parseInt(pid, 10)
                });
            }
            throw err;
        }
    }

    /**
     * Unbookmark a post
     * @param {Object} payload
     * @param {number} payload.pid
     * @param {number} payload.uid
     * @returns {Promise<Object>}
     */
    async unbookmarkPost(payload = {}) {
        const { pid, uid } = payload;

        if (!uid || uid <= 0) {
            Logger.warn(`Unauthenticated post unbookmark attempt on post ${pid}`);
            throw new AuthenticationException(ApiMessages.AUTH_REQUIRED_POST_BOOKMARK);
        }

        const existingPost = await this.postRepository.findById(pid, { uid });
        if (!existingPost) {
            Logger.warn(`Post unbookmark failed: post ${pid} not found`);
            throw new NotFoundException(ApiMessages.POST_NOT_FOUND);
        }

        try {
            const result = await this.postRepository.unbookmark(pid, uid);
            Logger.info(`Post ${pid} unbookmarked by user ${uid}`);
            return PostBookmarkTransformer.transform({ ...result, pid: parseInt(pid, 10) });
        } catch (err) {
            if (err.message && err.message.includes('already-unbookmarked')) {
                const currentPost = await this.postRepository.findById(pid, { uid });
                return PostBookmarkTransformer.transform({
                    post: currentPost || existingPost,
                    isBookmarked: false,
                    pid: parseInt(pid, 10)
                });
            }
            throw err;
        }
    }

    /**
     * Get bookmark status for a post
     * @param {Object} payload
     * @param {number} payload.pid
     * @param {number} payload.uid
     * @returns {Promise<Object>}
     */
    async getBookmarkStatus(payload = {}) {
        const { pid, uid } = payload;

        if (!uid || uid <= 0) {
            Logger.warn(`Unauthenticated post bookmark status check on post ${pid}`);
            throw new AuthenticationException(ApiMessages.AUTH_REQUIRED_POST_BOOKMARK);
        }

        const existingPost = await this.postRepository.findById(pid, { uid });
        if (!existingPost) {
            Logger.warn(`Post bookmark status failed: post ${pid} not found`);
            throw new NotFoundException(ApiMessages.POST_NOT_FOUND);
        }

        const result = await this.postRepository.getBookmarkStatus(pid, uid);

        return {
            pid: parseInt(pid, 10),
            bookmarked: Boolean(result)
        };
    }

    /**
     * Get flag status for a post
     * @param {number|string} uid
     * @param {number|string} pid
     * @returns {Promise<Object>}
     */
    async getFlagStatus(uid, pid) {
        if (!uid || uid <= 0) {
            Logger.warn(`Unauthenticated post flag status check on post ${pid}`);
            throw new AuthenticationException(ApiMessages.AUTH_REQUIRED_POST_FLAG_STATUS);
        }

        const numericPid = parseInt(pid, 10);

        if (isNaN(numericPid) || numericPid <= 0) {
            throw new NotFoundException(ApiMessages.POST_NOT_FOUND);
        }

        const existingPost = await this.postRepository.findById(numericPid, { uid });
        if (!existingPost) {
            Logger.warn(`Post flag status failed: post ${pid} not found`);
            throw new NotFoundException(ApiMessages.POST_NOT_FOUND);
        }

        const status = await this.postRepository.getFlagStatus(numericPid, uid);

        return PostFlagTransformer.transform({
            pid: numericPid,
            ...status
        });
    }

    /**
     * Flag/Report a post
     * @param {number|string} uid
     * @param {number|string} pid
     * @param {string} reason
     * @returns {Promise<Object>}
     */
    async flagPost(uid, pid, reason) {
        if (!uid || uid <= 0) {
            Logger.warn(`Unauthenticated flag attempt on post ${pid}`);
            throw new AuthenticationException(ApiMessages.AUTH_REQUIRED_POST_FLAG);
        }

        const numericPid = parseInt(pid, 10);
        if (isNaN(numericPid) || numericPid <= 0) {
            throw new NotFoundException(ApiMessages.POST_NOT_FOUND);
        }

        if (!reason || typeof reason !== 'string' || !reason.trim()) {
            throw new ValidationException(ApiMessages.VALIDATION_FAILED, {
                reason: 'Reason for flagging is required.'
            });
        }

        const existingPost = await this.postRepository.findById(numericPid, { uid });
        if (!existingPost) {
            Logger.warn(`Post flag failed: post ${pid} not found`);
            throw new NotFoundException(ApiMessages.POST_NOT_FOUND);
        }

        try {
            await this.postRepository.flagPost(numericPid, uid, reason.trim());
            Logger.info(`Post ${numericPid} flagged by user ${uid}`);

            const status = await this.postRepository.getFlagStatus(numericPid, uid);

            return PostFlagTransformer.transform({
                pid: numericPid,
                ...status
            });
        } catch (err) {
            if (err.message && (err.message.includes('already-flagged') || err.message.includes('already flagged'))) {
                const status = await this.postRepository.getFlagStatus(numericPid, uid);
                return PostFlagTransformer.transform({
                    pid: numericPid,
                    ...status
                });
            }
            throw err;
        }
    }

}

module.exports = PostService;
