'use strict';

const BaseRepository = require('../base/BaseRepository');

class NodeBBPostRepository extends BaseRepository {

    constructor() {
        super();
        this.posts = require.main.require('./src/posts');
        this.flags = require.main.require('./src/flags');
        this.db = require.main.require('./src/database');
    }

    /**
     * Find single post data by PID
     * @param {number|string} pid
     * @param {Object} options
     * @returns {Promise<Object|null>}
     */
    async findById(pid, options = {}) {
        const numericPid = parseInt(pid, 10);
        const uid = options.uid || 0;
        const postData = await this.posts.getPostData(numericPid);

        if (!postData || !postData.pid) {
            return null;
        }

        const postList = await this.posts.getPostsByPids([numericPid], uid);
        return postList && postList.length ? postList[0] : postData;
    }

    /**
     * Edit a post in NodeBB
     * @param {Object} options
     * @param {number} options.pid
     * @param {string} options.content
     * @param {number} options.uid
     * @param {string} [options.title]
     * @param {Array} [options.tags]
     * @returns {Promise<Object>}
     */
    async editPost(options = {}) {
        const result = await this.posts.edit({
            pid: options.pid,
            content: options.content,
            uid: options.uid,
            title: options.title,
            tags: options.tags
        });

        return result;
    }

    /**
     * Delete/Soft-delete a post in NodeBB
     * @param {Object} options
     * @param {number} options.pid
     * @param {number} options.uid
     * @returns {Promise<Object>}
     */
    async deletePost(options = {}) {
        const result = await this.posts.delete(options.pid, options.uid);
        return result;
    }

    /**
     * Restore a soft-deleted post in NodeBB using native tools
     * @param {Object} options
     * @param {number} options.pid
     * @param {number} options.uid
     * @returns {Promise<Object>}
     */
    async restorePost(options = {}) {
        return await this.posts.tools.restore(options.uid, options.pid);
    }

    /**
     * Upvote/Like a post in NodeBB
     * @param {number} pid
     * @param {number} uid
     * @returns {Promise<Object>}
     */
    async like(pid, uid) {
        return await this.posts.upvote(pid, uid);
    }

    /**
     * Unvote/Unlike a post in NodeBB
     * @param {number} pid
     * @param {number} uid
     * @returns {Promise<Object>}
     */
    async unlike(pid, uid) {
        return await this.posts.unvote(pid, uid);
    }

    /**
     * Get vote status for a post by UID
     * @param {number} pid
     * @param {number} uid
     * @returns {Promise<Object>}
     */
    async getLikeStatus(pid, uid) {
        return await this.posts.hasVoted(pid, uid);
    }

    /**
     * Bookmark a post in NodeBB
     * @param {number} pid
     * @param {number} uid
     * @returns {Promise<Object>}
     */
    async bookmark(pid, uid) {
        return await this.posts.bookmark(pid, uid);
    }

    /**
     * Unbookmark a post in NodeBB
     * @param {number} pid
     * @param {number} uid
     * @returns {Promise<Object>}
     */
    async unbookmark(pid, uid) {
        return await this.posts.unbookmark(pid, uid);
    }

    /**
     * Get bookmark status for a post by UID
     * @param {number} pid
     * @param {number} uid
     * @returns {Promise<boolean>}
     */
    async getBookmarkStatus(pid, uid) {
        return await this.posts.hasBookmarked(pid, uid);
    }

    /**
     * Get flag status for a post by PID and UID
     * @param {number|string} pid
     * @param {number|string} uid
     * @returns {Promise<Object>}
     */
    async getFlagStatus(pid, uid) {
        const numericPid = Number(pid);
        const numericUid = Number(uid);

        const [flagId, reportedByMe] = await Promise.all([
            this.flags.getFlagIdByTarget('post', numericPid),
            numericUid > 0 ? this.flags.exists('post', numericPid, numericUid) : Promise.resolve(false)
        ]);

        let state = null;

        if (flagId) {
            const flag = await this.flags.get(flagId);

            if (flag) {
                state = flag.state || null;
            }
        }

        return {
            flagged: Boolean(flagId),
            reportedByMe: Boolean(reportedByMe),
            flagState: state
        };
    }

    /**
     * Flag/Report a post in NodeBB
     * @param {number|string} pid
     * @param {number|string} uid
     * @param {string} reason
     * @returns {Promise<Object>}
     */
    async flagPost(pid, uid, reason) {
        return await this.flags.create(
            'post',
            Number(pid),
            Number(uid),
            reason
        );
    }

    /**
     * Get flag statuses for a collection of posts in batch (Zero N+1 queries)
     * @param {Array<number|string>} pids
     * @param {number|string} uid
     * @returns {Promise<Object>} Map of pid -> { flagged, reportedByMe, flagState }
     */
    async getFlagStatuses(pids = [], uid = 0) {
        if (!Array.isArray(pids) || !pids.length) {
            return {};
        }

        const numericPids = pids.map(pid => parseInt(pid, 10)).filter(pid => !isNaN(pid) && pid > 0);
        const numericUid = parseInt(uid, 10) || 0;

        if (!numericPids.length) {
            return {};
        }

        // 1. Batch fetch flagId for all posts and user report statuses concurrently
        const [postsFields, reportedByMeArray] = await Promise.all([
            this.posts.getPostsFields(numericPids, ['pid', 'flagId']),
            numericUid > 0
                ? this.db.isSortedSetMembers('flags:hash', numericPids.map(pid => `post:${pid}:${numericUid}`))
                : Promise.resolve(numericPids.map(() => false))
        ]);

        // 2. Collect active flagIds
        const activeFlagIds = (postsFields || [])
            .map(p => p && p.flagId)
            .filter(Boolean);

        // 3. Batch fetch flag states
        const flagStateMap = new Map();
        if (activeFlagIds.length > 0) {
            const flagKeys = activeFlagIds.map(f => `flag:${f}`);
            const flagObjects = await this.db.getObjectsFields(flagKeys, ['flagId', 'state']);
            (flagObjects || []).forEach((f, idx) => {
                if (f && activeFlagIds[idx]) {
                    flagStateMap.set(String(activeFlagIds[idx]), f.state || null);
                }
            });
        }

        // 4. Map results by PID
        const result = {};
        numericPids.forEach((pid, idx) => {
            const postField = postsFields[idx];
            const flagId = postField && postField.flagId ? String(postField.flagId) : null;
            const flagged = Boolean(flagId);
            const reportedByMe = Boolean(reportedByMeArray && reportedByMeArray[idx]);
            const flagState = flagId ? (flagStateMap.get(flagId) || null) : null;

            result[pid] = {
                flagged,
                reportedByMe,
                flagState
            };
        });

        return result;
    }

    /**
     * Get deletion status of a post in NodeBB
     * @param {number|string} pid
     * @returns {Promise<Object>}
     */
    async getDeletionStatus(pid) {
        const numericPid = parseInt(pid, 10);

        if (!numericPid || numericPid <= 0) {
            return {
                deleted: false,
                deleterUid: null
            };
        }

        const data = await this.posts.getPostsFields(
            [numericPid],
            ['deleted', 'deleterUid']
        );

        const post = data && data[0];

        return {
            deleted: Boolean(post && Number(post.deleted)),
            deleterUid:
                post && Number(post.deleterUid) > 0
                    ? Number(post.deleterUid)
                    : null
        };
    }

    /**
     * Get deletion status for multiple posts in batch
     * @param {Array<number|string>} pids
     * @returns {Promise<Object<number, Object>>}
     */
    async getDeletionStatuses(pids = []) {
        if (!Array.isArray(pids) || !pids.length) {
            return {};
        }

        const numericPids = [...new Set(
            pids
                .map(pid => parseInt(pid, 10))
                .filter(pid => pid > 0)
        )];

        if (!numericPids.length) {
            return {};
        }

        const postsData = await this.posts.getPostsFields(
            numericPids,
            ['deleted', 'deleterUid']
        );

        const result = {};

        numericPids.forEach((pid, index) => {
            const post = (postsData && postsData[index]) || {};

            result[pid] = {
                deleted: Boolean(post && Number(post.deleted)),
                deleterUid:
                    post && Number(post.deleterUid) > 0
                        ? Number(post.deleterUid)
                        : null
            };
        });

        return result;
    }

}

module.exports = NodeBBPostRepository;
