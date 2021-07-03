function authMiddleware(req, res, next) {
    if (res.locals.objectName.length == 0) {
        return res.status("400").send("unauthorized")
    }
    next();
}
module.exports = authMiddleware