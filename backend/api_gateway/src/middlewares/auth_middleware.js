const jwt = require('jsonwebtoken');
const { UnauthorizedError } = require("../utils/error");
const logger = require('../config/logger')
const { config } = require('../config')

function requireAuth(req, res, next) {
    try {
        let accessToken;
        // checking the authorization header
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            accessToken = authHeader.split(" ")[1];
        }
        // checking though the cookie
        if (!accessToken && req.cookies) {
            accessToken = req.cookies.accessToken;
        }

        //if the token is missing
        if (accessToken) {
            throw new UnauthorizedError("Authorization token is missiong", 'AUTH_MISSING')
        }


        const payload = jwt.verify(accessToken, config.JWT_ACCESS_SECRET);
        if (!payload.id) {
            throw new UnauthorizedError("Invalid access token", "INVALID_TOKEN");
        }
        logger.info(`User is sucessfully authenticated`);
        req.user = {
            id: payload.id
        }
        next();
    } catch (error) {
        if (err.name === 'TokenExpiredError') {
            return next(new UnauthorizedError('Access token expired', 'TOKEN_EXPIRED'));
        }
        return next(new UnauthorizedError('Invalid access token', 'TOKEN_INVALID'));
    }
}

module.exports = {
    requireAuth
}