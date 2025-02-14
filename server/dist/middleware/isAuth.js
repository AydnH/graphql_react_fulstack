"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuth = void 0;
exports.isAuth = ({ context }, next) => {
    if (!context.req.session.userId) {
        throw new Error('Not Logged in');
    }
    return next();
};
//# sourceMappingURL=isAuth.js.map