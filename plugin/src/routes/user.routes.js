'use strict';

const ApiRoutes = require('../constants/ApiRoutes');
const UserController = require('../controllers/UserController');
const AsyncHandler = require('../helpers/AsyncHandler');

module.exports = (router) => {

    // GET /api/v1/users/me (Must be registered before :uid)
    router.get(
        ApiRoutes.USER_ME,
        AsyncHandler((req, res, next) => UserController.getMe(req, res, next))
    );

    // GET /api/v1/users/:uid
    router.get(
        ApiRoutes.USER_PROFILE,
        AsyncHandler((req, res, next) => UserController.getUserById(req, res, next))
    );

    // GET /api/v1/users/:uid/topics
    router.get(
        ApiRoutes.USER_TOPICS,
        AsyncHandler((req, res, next) => UserController.topics(req, res, next))
    );

    // GET /api/v1/users/:uid/posts
    router.get(
        ApiRoutes.USER_POSTS,
        AsyncHandler((req, res, next) => UserController.posts(req, res, next))
    );

    // GET /api/v1/users/:uid/followers
    router.get(
        ApiRoutes.USER_FOLLOWERS,
        AsyncHandler((req, res, next) => UserController.followers(req, res, next))
    );

    // GET /api/v1/users/:uid/following
    router.get(
        ApiRoutes.USER_FOLLOWING,
        AsyncHandler((req, res, next) => UserController.following(req, res, next))
    );

    // GET /api/v1/users/:uid/statistics
    router.get(
        ApiRoutes.USER_STATISTICS,
        AsyncHandler((req, res, next) => UserController.statistics(req, res, next))
    );

    // GET /api/v1/users/:uid/engagement
    router.get(
        ApiRoutes.USER_ENGAGEMENT,
        AsyncHandler((req, res, next) => UserController.engagement(req, res, next))
    );

    // GET /api/v1/users/:uid/activity
    router.get(
        ApiRoutes.USER_ACTIVITY,
        AsyncHandler((req, res, next) => UserController.activity(req, res, next))
    );

    // POST /api/v1/users/:uid/follow (Follow User)
    router.post(
        ApiRoutes.USER_FOLLOW,
        AsyncHandler((req, res, next) => UserController.follow(req, res, next))
    );

    // DELETE /api/v1/users/:uid/follow (Unfollow User)
    router.delete(
        ApiRoutes.USER_FOLLOW,
        AsyncHandler((req, res, next) => UserController.unfollow(req, res, next))
    );

    // GET /api/v1/users/:uid/follow (Get Follow Status)
    router.get(
        ApiRoutes.USER_FOLLOW,
        AsyncHandler((req, res, next) => UserController.followStatus(req, res, next))
    );

};


