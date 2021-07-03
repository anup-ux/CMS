const express = require("express");
const multer = require("multer")
upload = multer()
const logout = express.Router();
// const controller = require("../controller/article.controller")
logout.get("/", (req, res) => {
    console.log("reached logout");
    res.cookie('user_id', "")
    res.redirect("/articles")
})
module.exports = logout