'use strict';

const BaseController = require('./BaseController');
const Container = require('../container');
const ContainerKeys = require('../constants/ContainerKeys');
const ApiMessages = require('../constants/ApiMessages');
const HttpStatus = require('../constants/HttpStatus');
const PostValidator = require('../validators/PostValidator');

class PostController extends BaseController {

    /**
     * Get PostService instance from DI Container
     * @returns {import('../services/PostService')}
     */
    getPostService() {
        return Container.get(ContainerKeys.SERVICES.POST);
    }

    /**
     * PUT /api/v1/posts/:pid
     */
    async edit(req, res, next) {
        const payload = PostValidator.validateEdit(req.params.pid, req.body);
        const uid = req.uid || 0;
        const service = this.getPostService();

        const result = await service.editPost({
            ...payload,
            uid
        });

        return this.sendSuccess(
            res,
            ApiMessages.POST_UPDATED_SUCCESSFULLY,
            result,
            HttpStatus.OK
        );
    }

    /**
     * DELETE /api/v1/posts/:pid
     */
    async delete(req, res, next) {
        const pid = PostValidator.validatePid(req.params.pid);
        const uid = req.uid || 0;
        const service = this.getPostService();

        const result = await service.deletePost({
            pid,
            uid
        });

        return this.sendSuccess(
            res,
            ApiMessages.POST_DELETED_SUCCESSFULLY,
            result,
            HttpStatus.OK
        );
    }

    /**
     * POST /api/v1/posts/:pid/restore
     */
    async restore(req, res, next) {
        const pid = PostValidator.validatePid(req.params.pid);
        const uid = req.uid || 0;
        const service = this.getPostService();

        const result = await service.restorePost({
            pid,
            uid
        });

        return this.sendSuccess(
            res,
            ApiMessages.POST_RESTORED_SUCCESSFULLY,
            result,
            HttpStatus.OK
        );
    }

    /**
     * POST /api/v1/posts/:pid/like
     */
    async like(req, res, next) {
        const pid = PostValidator.validatePid(req.params.pid);
        const uid = req.uid || 0;
        const service = this.getPostService();

        const result = await service.likePost({
            pid,
            uid
        });

        return this.sendSuccess(
            res,
            ApiMessages.POST_LIKED_SUCCESSFULLY,
            result,
            HttpStatus.OK
        );
    }

    /**
     * DELETE /api/v1/posts/:pid/like
     */
    async unlike(req, res, next) {
        const pid = PostValidator.validatePid(req.params.pid);
        const uid = req.uid || 0;
        const service = this.getPostService();

        const result = await service.unlikePost({
            pid,
            uid
        });

        return this.sendSuccess(
            res,
            ApiMessages.POST_UNLIKED_SUCCESSFULLY,
            result,
            HttpStatus.OK
        );
    }

    /**
     * GET /api/v1/posts/:pid/like
     */
    async likeStatus(req, res, next) {
        const pid = PostValidator.validatePid(req.params.pid);
        const uid = req.uid || 0;
        const service = this.getPostService();

        const result = await service.getLikeStatus({
            pid,
            uid
        });

        return this.sendSuccess(
            res,
            ApiMessages.POST_LIKE_STATUS_FETCHED,
            result,
            HttpStatus.OK
        );
    }

    /**
     * POST /api/v1/posts/:pid/bookmark
     */
    async bookmark(req, res, next) {
        const pid = PostValidator.validatePid(req.params.pid);
        const uid = this.getUserId(req);
        const service = this.getPostService();

        const result = await service.bookmarkPost({
            pid,
            uid
        });

        return this.sendSuccess(
            res,
            ApiMessages.POST_BOOKMARKED_SUCCESSFULLY,
            result,
            HttpStatus.OK
        );
    }

    /**
     * DELETE /api/v1/posts/:pid/bookmark
     */
    async unbookmark(req, res, next) {
        const pid = PostValidator.validatePid(req.params.pid);
        const uid = this.getUserId(req);
        const service = this.getPostService();

        const result = await service.unbookmarkPost({
            pid,
            uid
        });

        return this.sendSuccess(
            res,
            ApiMessages.POST_UNBOOKMARKED_SUCCESSFULLY,
            result,
            HttpStatus.OK
        );
    }

    /**
     * GET /api/v1/posts/:pid/bookmark
     */
    async bookmarkStatus(req, res, next) {
        const pid = PostValidator.validatePid(req.params.pid);
        const uid = this.getUserId(req);
        const service = this.getPostService();

        const result = await service.getBookmarkStatus({
            pid,
            uid
        });

        return this.sendSuccess(
            res,
            ApiMessages.POST_BOOKMARK_STATUS_FETCHED,
            result,
            HttpStatus.OK
        );
    }

    /**
     * POST /api/v1/posts/:pid/flag
     */
    async flag(req, res, next) {
        const pid = PostValidator.validatePid(req.params.pid);
        const uid = this.getUserId(req);
        const reason = req.body ? req.body.reason : null;
        const service = this.getPostService();

        const result = await service.flagPost(uid, pid, reason);

        return this.sendSuccess(
            res,
            ApiMessages.POST_FLAGGED_SUCCESSFULLY,
            result,
            HttpStatus.OK
        );
    }

    /**
     * GET /api/v1/posts/:pid/flag
     */
    async flagStatus(req, res, next) {
        const pid = PostValidator.validatePid(req.params.pid);
        const uid = this.getUserId(req);
        const service = this.getPostService();

        const result = await service.getFlagStatus(uid, pid);

        return this.sendSuccess(
            res,
            ApiMessages.POST_FLAG_STATUS_FETCHED,
            result,
            HttpStatus.OK
        );
    }

}

module.exports = new PostController();
