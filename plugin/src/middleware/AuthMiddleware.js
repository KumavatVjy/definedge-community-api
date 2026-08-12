'use strict';

const Logger = require('../helpers/Logger');

let secret = null;
let cookieSignature = null;
let db = null;

try {
    const nconf = require.main.require('nconf');
    secret = nconf.get('secret');
    cookieSignature = require.main.require('cookie-signature');
    db = require.main.require('./src/database');
} catch (e) {
    Logger.warn('AuthMiddleware: could not load NodeBB session dependencies directly');
}

/**
 * Middleware to resolve authenticated user UID from session headers.
 * Supports both raw (s:...) and URL-encoded (s%3A...) session cookies.
 */
module.exports = async (req, res, next) => {
    // 1. If req.uid is already attached by NodeBB, proceed
    if (req.uid && Number(req.uid) > 0) {
        return next();
    }

    // 2. Check if req.user is attached by Passport
    if (req.user && req.user.uid && Number(req.user.uid) > 0) {
        req.uid = Number(req.user.uid);
        return next();
    }

    // 3. Fallback: Parse Cookie header for URL-encoded (s%3A...) or raw (s:...) express.sid
    if (req.headers && req.headers.cookie && secret && cookieSignature && db) {
        try {
            const rawCookieHeader = req.headers.cookie;
            const match = rawCookieHeader.match(/express\.sid=([^;]+)/);
            if (match && match[1]) {
                const cookieVal = match[1].trim();
                const decodedVal = decodeURIComponent(cookieVal);

                if (decodedVal.startsWith('s:')) {
                    const sessionId = cookieSignature.unsign(decodedVal.slice(2), secret);
                    if (sessionId) {
                        const sessJson = await db.get(`session:${sessionId}`);
                        if (sessJson) {
                            const sess = JSON.parse(sessJson);
                            if (sess && sess.passport && sess.passport.user) {
                                const resolvedUid = parseInt(sess.passport.user, 10);
                                if (!isNaN(resolvedUid) && resolvedUid > 0) {
                                    req.uid = resolvedUid;
                                    req.user = { uid: resolvedUid };
                                }
                            }
                        }
                    }
                }
            }
        } catch (err) {
            Logger.warn(`AuthMiddleware session resolution error: ${err.message}`);
        }
    }

    next();
};
