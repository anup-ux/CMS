const { Router } = require("express");
const express = require("express");
const multer = require("multer")
const auth = require("../auth")
upload = multer()
fileMiddleWare = upload.single('file')

const routers = express.Router();
const controller = require("../controller/article.controller")
routers.get("/fetch", controller.fetchForNext)
routers.get("/articles", controller.getContents)
routers.get("/insert", auth, (req, res) => {
    res.render("insert");
})
routers.get("/:id", fileMiddleWare, controller.getElementById)
routers.delete("/delete/:id", auth, controller.deleteElementById)
routers.post("/create-new", fileMiddleWare, controller.create)
routers.get("/uploads/:id/:filename", (req, res) => {
    controller.getImgInSrc(req, res)
})
routers.get("/articles/uploads/:id/:filename", (req, res) => {
    controller.getImgInSrc2(req, res)
})
routers.get("/update/:id", auth, fileMiddleWare, controller.updateElementByIdDisplay)
routers.post("/update/:id", [auth, fileMiddleWare], controller.updateController)
routers.post("/fileOfCkeditor", upload.single('upload'), (req, res) => {
    controller.localFileCkeditor(req, res)
})
routers.post("/update/Ckeditor/:id", upload.single('upload'), (req, res) => {
    controller.localFileCkeditor(req, res)
})
routers.get("/uploads/:image", fileMiddleWare, controller.viewImgOfCk)

routers.get("/articles/search?:search", controller.searchBar)
routers.get("/article/search", controller.searchBar2)
routers.get("/articles/pegination", controller.pegination)
routers.post("/user/login", controller.login)
module.exports = routers


/////id auto incremental