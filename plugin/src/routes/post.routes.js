'use strict';

const ApiRoutes = require('../constants/ApiRoutes');
const PostController = require('../controllers/PostController');
const AsyncHandler = require('../helpers/AsyncHandler');

module.exports = (router) => {

    // PUT /api/v1/posts/:pid (Edit Post)
    router.put(
        ApiRoutes.POST_EDIT,
        AsyncHandler((req, res, next) => PostController.edit(req, res, next))
    );

    // DELETE /api/v1/posts/:pid (Delete Post)
    router.delete(
        ApiRoutes.POST_DELETE,
        AsyncHandler((req, res, next) => PostController.delete(req, res, next))
    );

    // POST /api/v1/posts/:pid/restore (Restore Post)
    router.post(
        ApiRoutes.POST_RESTORE,
        AsyncHandler((req, res, next) => PostController.restore(req, res, next))
    );

    // POST /api/v1/posts/:pid/like (Like Post)
    router.post(
        ApiRoutes.POST_LIKE,
        AsyncHandler((req, res, next) => PostController.like(req, res, next))
    );

    // DELETE /api/v1/posts/:pid/like (Unlike Post)
    router.delete(
        ApiRoutes.POST_LIKE,
        AsyncHandler((req, res, next) => PostController.unlike(req, res, next))
    );

    // GET /api/v1/posts/:pid/like (Get Post Like Status)
    router.get(
        ApiRoutes.POST_LIKE,
        AsyncHandler((req, res, next) => PostController.likeStatus(req, res, next))
    );

    // POST /api/v1/posts/:pid/bookmark (Bookmark Post)
    router.post(
        ApiRoutes.POST_BOOKMARK,
        AsyncHandler((req, res, next) => PostController.bookmark(req, res, next))
    );

    // DELETE /api/v1/posts/:pid/bookmark (Unbookmark Post)
    router.delete(
        ApiRoutes.POST_BOOKMARK,
        AsyncHandler((req, res, next) => PostController.unbookmark(req, res, next))
    );

    // GET /api/v1/posts/:pid/bookmark (Get Post Bookmark Status)
    router.get(
        ApiRoutes.POST_BOOKMARK,
        AsyncHandler((req, res, next) => PostController.bookmarkStatus(req, res, next))
    );

    // POST /api/v1/posts/:pid/flag (Report Post)
    router.post(
        ApiRoutes.POST_FLAG,
        AsyncHandler((req, res, next) => PostController.flag(req, res, next))
    );

    // GET /api/v1/posts/:pid/flag (Get Post Flag Status)
    router.get(
        ApiRoutes.POST_FLAG,
        AsyncHandler((req, res, next) => PostController.flagStatus(req, res, next))
    );

};
