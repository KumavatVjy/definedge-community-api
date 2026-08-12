'use strict';

const BaseController = require('./BaseController');
const Container = require('../container');
const ContainerKeys = require('../constants/ContainerKeys');
const ApiMessages = require('../constants/ApiMessages');
const HttpStatus = require('../constants/HttpStatus');
const UserValidator = require('../validators/UserValidator');
const ValidationException = require('../exceptions/ValidationException');

class UserController extends BaseController {

    /**
     * Get UserService instance from DI container
     * @returns {import('../services/UserService')}
     */
    getUserService() {
        return Container.get(ContainerKeys.SERVICES.USER);
    }

    /**
     * GET /api/v1/users/me
     */
    async getMe(req, res, next) {
        const uid = this.getUserId(req);
        const service = this.getUserService();

        const profile = await service.getCurrentUser(uid);

        return this.sendSuccess(
            res,
            ApiMessages.USER_PROFILE_FETCHED,
            profile,
            HttpStatus.OK
        );
    }

    /**
     * GET /api/v1/users/:uid
     */
    async getUserById(req, res, next) {
        const uid = UserValidator.validateUid(req.params.uid);
        const service = this.getUserService();

        const profile = await service.getProfile(uid);

        return this.sendSuccess(
            res,
            ApiMessages.USER_PROFILE_FETCHED,
            profile,
            HttpStatus.OK
        );
    }

    /**
     * GET /api/v1/users/:uid/topics
     */
    async topics(req, res, next) {
        const errors = UserValidator.validateTopics(
            req.params,
            req.query
        );

        if (Object.keys(errors).length > 0) {
            throw new ValidationException(
                ApiMessages.VALIDATION_FAILED,
                errors
            );
        }

        const uid = Number(req.params.uid);
        const page = Number(req.query.page || 1);
        const limit = Number(req.query.limit || 20);

        const callerUid = req.uid || 0;
        const service = this.getUserService();

        const result = await service.getTopics({
            uid,
            page,
            limit,
            callerUid
        });

        return this.sendSuccess(
            res,
            ApiMessages.USER_TOPICS_FETCHED,
            result,
            HttpStatus.OK
        );
    }

    /**
     * GET /api/v1/users/:uid/posts
     */
    async posts(req, res, next) {
        const errors = UserValidator.validatePosts(
            req.params,
            req.query
        );

        if (Object.keys(errors).length > 0) {
            throw new ValidationException(
                ApiMessages.VALIDATION_FAILED,
                errors
            );
        }

        const uid = Number(req.params.uid);
        const page = Number(req.query.page || 1);
        const limit = Number(req.query.limit || 20);
        const callerUid = this.getUserId(req);

        const service = this.getUserService();

        const result = await service.getPosts({
            uid,
            page,
            limit,
            callerUid
        });

        return this.sendSuccess(
            res,
            ApiMessages.USER_POSTS_FETCHED,
            result,
            HttpStatus.OK
        );
    }

    /**
     * GET /api/v1/users/:uid/followers
     */
    async followers(req, res, next) {
        const errors = UserValidator.validateFollowers(
            req.params,
            req.query
        );

        if (Object.keys(errors).length > 0) {
            throw new ValidationException(
                ApiMessages.VALIDATION_FAILED,
                errors
            );
        }

        const uid = Number(req.params.uid);
        const page = Number(req.query.page || 1);
        const limit = Number(req.query.limit || 20);

        const service = this.getUserService();

        const result = await service.getFollowers({
            uid,
            page,
            limit
        });

        return this.sendSuccess(
            res,
            ApiMessages.USER_FOLLOWERS_FETCHED,
            result,
            HttpStatus.OK
        );
    }

    /**
     * GET /api/v1/users/:uid/following
     */
    async following(req, res, next) {
        const errors = UserValidator.validateFollowing(
            req.params,
            req.query
        );

        if (Object.keys(errors).length > 0) {
            throw new ValidationException(
                ApiMessages.VALIDATION_FAILED,
                errors
            );
        }

        const uid = Number(req.params.uid);
        const page = Number(req.query.page || 1);
        const limit = Number(req.query.limit || 20);

        const service = this.getUserService();

        const result = await service.getFollowing({
            uid,
            page,
            limit
        });

        return this.sendSuccess(
            res,
            ApiMessages.USER_FOLLOWING_FETCHED,
            result,
            HttpStatus.OK
        );
    }

    /**
     * GET /api/v1/users/:uid/statistics
     */
    async statistics(req, res, next) {
        const uid = UserValidator.validateUid(req.params.uid);
        const service = this.getUserService();

        const stats = await service.getStatistics(uid);

        return this.sendSuccess(
            res,
            ApiMessages.USER_STATISTICS_FETCHED,
            stats,
            HttpStatus.OK
        );
    }

    /**
     * GET /api/v1/users/:uid/engagement
     */
    async engagement(req, res, next) {
        const uid = UserValidator.validateUid(req.params.uid);
        const service = this.getUserService();

        const result = await service.getEngagement(uid);

        return this.sendSuccess(
            res,
            ApiMessages.USER_ENGAGEMENT_FETCHED,
            result,
            HttpStatus.OK
        );
    }

    /**
     * GET /api/v1/users/:uid/activity
     */
    async activity(req, res, next) {
        const errors = UserValidator.validateActivity(
            req.params,
            req.query
        );

        if (Object.keys(errors).length > 0) {
            throw new ValidationException(
                ApiMessages.VALIDATION_FAILED,
                errors
            );
        }

        const uid = Number(req.params.uid);
        const page = Number(req.query.page || 1);
        const limit = Number(req.query.limit || 20);
        const callerUid = this.getUserId(req);

        const service = this.getUserService();

        const result = await service.getActivity({
            uid,
            page,
            limit,
            callerUid
        });

        return this.sendSuccess(
            res,
            ApiMessages.USER_ACTIVITY_FETCHED,
            result,
            HttpStatus.OK
        );
    }

    /**
     * POST /api/v1/users/:uid/follow
     */
    async follow(req, res, next) {
        const targetUid = UserValidator.validateUid(req.params.uid);
        const uid = this.getUserId(req);
        const service = this.getUserService();

        const result = await service.followUser(uid, targetUid);

        return this.sendSuccess(
            res,
            ApiMessages.USER_FOLLOWED,
            result,
            HttpStatus.OK
        );
    }

    /**
     * DELETE /api/v1/users/:uid/follow
     */
    async unfollow(req, res, next) {
        const targetUid = UserValidator.validateUid(req.params.uid);
        const uid = this.getUserId(req);
        const service = this.getUserService();

        const result = await service.unfollowUser(uid, targetUid);

        return this.sendSuccess(
            res,
            ApiMessages.USER_UNFOLLOWED,
            result,
            HttpStatus.OK
        );
    }

    /**
     * GET /api/v1/users/:uid/follow
     */
    async followStatus(req, res, next) {
        const targetUid = UserValidator.validateUid(req.params.uid);
        const uid = this.getUserId(req);
        const service = this.getUserService();

        const result = await service.getFollowingStatus(uid, targetUid);

        return this.sendSuccess(
            res,
            ApiMessages.USER_FOLLOW_STATUS_FETCHED,
            result,
            HttpStatus.OK
        );
    }

}

module.exports = new UserController();


