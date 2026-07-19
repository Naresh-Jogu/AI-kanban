const { verifyToken } = require("../utils/jwt");
const ApiError = require("../utils/ApiError");


const requireAuth = (req, _res, next) => {
    try {
        const header = req.headers.authorization || "";

        const token = header.startsWith("Bearer ") ? header.slice(7) : null;

        if (!token) throw ApiError.unauthourized("Missing authencation token");

        const decoded = verifyToken(token);

        req.user = {
            id: decoded.id,
            email: decoded.email,
            name: decoded.name,
        }

        next();


    } catch (err) {
        if(err.isAppError) return next(err);

        next(ApiError.unauthourized("Invalid or expired token"));
    }
}

module.exports = {requireAuth}; 