const express = require("express");
const app = express();
const signup = require("./routes/signup")
const routes = require("./routes/paths")
const cookieParser = require('cookie-parser')
const controller = require('./controller/article.controller')
const model = require('./model/article.model')
const singupModel = require('./model/user.model')
const cors=require('cors')
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs")
app.use(cors())
app.use(cookieParser())
app.use(function(req, res, next) {

    if (req.originalUrl && req.originalUrl.split("/").pop() === 'favicon.ico') {
        return res.sendStatus(204);
    }

    return next();

});
app.use(async function(req, res, next) {
    // res.cookie('user_id', userDataBeingInserted[0].user_id)
    if (req.cookies.user_id) {
        console.log("cookies yum yum", req.cookies.user_id);
        // locals has the user
        res.locals.objectName = (await singupModel.getId(req.cookies.user_id))
        console.log("type of the object is", res.locals.objectName);
    } else {
        res.locals.objectName = []
    }
    next()
})
const logout = require("./routes/logout")
app.use("/logout", logout)
app.use("/signup", signup)
app.use("/", routes)
app.set("views", "views")
app.listen(7001, () => {
    console.log("listening at 7001")
})