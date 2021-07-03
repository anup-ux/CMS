const express = require("express");
const multer = require("multer")
upload = multer()
const singup = express.Router();
const controller = require("../controller/article.controller")
singup.post("/user/new", upload.single('image'), controller.register)
module.exports = singup