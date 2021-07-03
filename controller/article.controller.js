const express = require("express")
const model = require("../model/article.model")
const path = require('path');
const fs = require("fs")
const slug = require("slug")
const { json } = require("express");
const { updateSpecificField } = require("../model/article.model");
const signUpModel = require("../model/user.model")
    //    ************************************************************create/insert****************************************************************************
module.exports = {
    async create(req, res) {
        const dataBeingInserted = {
                title: req.body.title,
                content: req.body.content,
                files: req.file,
                slugs: slug(req.body.title),
                date: req.body.published_at
            }
            // console.log("req.file", req.file);
            // console.log("id %%%%%%%%%%%%%", id);
            // console.log("dcsdcs", body, files, slugs);
        if (!req.body.title) {
            return res.status(422).json({ error: true, data: { message: "title can not be empty" } })
        }
        try {

            let articlesBeingInserted = await model.insert(dataBeingInserted);
            filename = req.file.originalname
            let articlesBeingInsertedId = articlesBeingInserted[0].id;
            let nameOfTheFile = req.file.originalname
            let foldername = articlesBeingInserted[0].id.toString()
            let filePathUpdate = path.join("uploads", foldername, nameOfTheFile);
            console.log(filePathUpdate);
            console.log("*********************", articlesBeingInserted);
            const folderCreate = await createFolder(articlesBeingInserted[0].id.toString());
            const fileCreate = await writeFile(req.file.originalname, req.file.buffer, articlesBeingInserted[0].id.toString());
            const controllerForSpecificField = await model.updateSpecificField(articlesBeingInsertedId, { file: filePathUpdate })
                // let filePathUpdate2 = path.join("uploads", articlesBeingInserted[0].id.toString, FileOfCkEditor.originalname);
            res.redirect("/articles")
        } catch (err) {
            console.log("error", err);
            res.status(500).json({ error: true, data: { message: "Error while inserting data" } })
        }
    },
    //    ************************************************************view all elemtns in a table****************************************************************************

    async getContents(req, res) {
        const date = {}
        const page = req.query.page || 1
        const limit = req.query.page || 2

        try {
            const article = await model.getData(page, limit);
            res.render("dummy2", { data: article.totalList, date, count: article.totalNumber, page: page, limit: limit });
        } catch (err) {
            console.error("Error while retriving article", err);
            res.status(500).json({ error: true, data: { message: err.message } });
        }
    },
    // *******************************************************fetch for the page next btn*****
    async fetchForNext(req, res) {
        const page = req.query.page || 1
        const limit = req.query.limit || 2
        try {
            console.log("page and limit", page, limit);
            const article = await model.getData(page, limit);
            res.send(article)
            console.log("article from constroller", article);
        } catch (err) {
            console.error("Error while retriving article", err);
            res.status(500).json({ error: true, data: { message: err.message } });
        }
    },
    //    ************************************************************ view individual elemetn by id****************************************************************************


    async getElementById(req, res) {
        const idPassedInUrl = req.params.id;
        console.log("url passed", idPassedInUrl);
        try {
            const dateToEjs = {

            }

            const BlogData = await model.dbQueryForId(idPassedInUrl); /////trying to get data
            function formatDate(date) {
                var d = new Date(date),
                    month = '' + (d.getMonth() + 1),
                    day = '' + d.getDate(),
                    year = d.getFullYear();
                if (month.length < 2)
                    month = '0' + month;
                if (day.length < 2)
                    day = '0' + day;
                dateToEjs.dateReturned = [day, month, year].join('-');
                return [year, month, day].join('-');
            }

            formatDate(BlogData[0].published_at);
            console.log("published at date", BlogData[0].published_at)
            res.render("view", { BlogData, dateToEjs });
        } catch (err) {
            console.error("Error while retriving the articles", err);
            res.status(500).json({ error: true, data: { message: err.message } });
        }

    },
    //    ************************************************************ delete individual elemetn by id****************************************************************************

    async deleteElementById(req, res) {
        const eItBd = req.params.id;
        try {
            const deleteQuery = await model.dbQueryForDelete(eItBd); /////trying to get data
            res.status(202).send("deleted") ////////////////////dont have to redirect to articles///////////

        } catch (err) {
            console.error("Error while deleting article", err);
            res.status(500).json({ error: true, data: { message: err.message } });
        }
    },
    //************************************************************ view individual elemetn by id for update****************************************************************************

    async updateElementByIdDisplay(req, res) {
        const eItBuD = req.params.id; ////elementIdToBeUpdatedDisplay
        const dateToEjs = {}
        try {
            const updateQuery = await model.dbQueryForViewUpdate(eItBuD);

            function formatDate(date) {
                var d = new Date(date),
                    month = '' + (d.getMonth() + 1),
                    day = '' + d.getDate(),
                    year = d.getFullYear();
                if (month.length < 2)
                    month = '0' + month;
                if (day.length < 2)
                    day = '0' + day;
                dateToEjs.dateReturned = [day, month, year].join('-');
                return [year, month, day].join('-');
            }

            formatDate(updateQuery[0].published_at);
            /////trying to get data
            res.render("update", { updateQuery, eItBuD, dateToEjs });
        } catch (err) {
            console.error("Error while getting article", err);
            res.status(500).json({ error: true, data: { message: err.message } });
        }
    },
    // ************************************************************ update individual elemetn****************************************************************************

    async updateController(req, res) {
        console.log(req.body);
        console.log(req.params.id);
        const dataWithoutFile = {
            parampassedForId: req.params.id,
            title: req.body.title,
            content: req.body.content,
            slugs: slug(req.body.title),
            date: req.body.date
        }

        try {
            if (!req.file) {
                const updateQueryForReal = await model.updateControllerModelWithoutFile(dataWithoutFile); /////trying to get data
                res.redirect("/articles")
            } else {
                const theData = {
                    parampassedForId: req.params.id,
                    title: req.body.title,
                    content: req.body.content,
                    file: req.file,
                    slugs: slug(req.body.title),
                    path: path.join("uploads", req.params.id, req.file.originalname),
                    date: req.body.date
                }
                const fileCreate = await writeFile(req.file.originalname, req.file.buffer, theData.parampassedForId.toString());
                const updateQueryWithFile = await model.updateControllerModel(theData);
                res.redirect("/articles")
            }

        } catch (err) {
            console.error("Error while updating article", err);
            res.status(500).json({ error: true, data: { message: err.message } });
        }
    },

    getImgInSrc(req, res) {
        let id = req.params.id
        let file = req.params.filename
        let srcpath = path.join(__dirname, `../uploads/${id}/${file}`)
        fs.readFile(srcpath, (err, data) => {
                if (err) {
                    console.log(err);
                    return false
                }
                res.setHeader("content-type", "image/png")
                res.end(data)
            })
            // res.sendFile(srcpath)

    },
    getImgInSrc2(req, res) {
        let id = req.params.id
        let file = req.params.filename
        let srcpath = path.join(__dirname, `../uploads/${id}/${file}`)
        fs.readFile(srcpath, (err, data) => {
            if (err) {
                console.log(err);
                return false
            }
            res.setHeader("content-type", "image/png")
            res.end(data)
        })
    },
    localFileCkeditor(req, res) {
        console.log("body", req.body);
        console.log("file", req.file);
        foldername = req.params.id
        filename = req.file.originalname
        let pathToTheFile = path.join(`../uploads/${foldername}/${filename}`)
        let srcpath = path.join(__dirname, `../uploads/${foldername}/${filename}`)
        fs.writeFile(srcpath, req.file.buffer, (err) => {
            if (err) {
                console.log(err);
                return false
            }
            // res.setHeader("content-type", "image/png")
            res.send({
                "uploaded": 1,
                "fileName": req.file.originalname,
                "url": pathToTheFile,
                "error": "error"
            })
        })
    },
    viewImgOfCk(req, res) {
        file = req.params.image
        let srcpath = path.join(__dirname, `../uploads/${file}`)
        fs.readFile(srcpath, (err, data) => {
            if (err) {
                console.log(err);
                return false
            }
            res.setHeader("content-type", "image/png")
            res.end(data)
        })
    },
    // ***********************************SEARCHBAR***********************************************
    async searchBar(req, res) {
        let searchValue = req.query.search
        try {
            const awaitForSearcModel = await model.searchModel(searchValue)
            console.log("search after model", awaitForSearcModel);
            res.render("search", { awaitForSearcModel })
        } catch (err) { console.log("err from search", err); }

    },
    // ******************************SEARCHBAR USING AJAX***********************************
    async searchBar2(req, res) {
        let searchValue = req.query.search
        const awaitForSearcModel = await model.searchModel2(searchValue)
        console.log("search after model", awaitForSearcModel);
        res.json(awaitForSearcModel)
    },
    // ********************************************************pegination***************************************
    async pegination(req, res) {
        const page = req.query.page
        const limit = req.query.limit
        const gotoModel = await model.peginationModel(page, limit)
        console.log(gotoModel);
    },
    // User registration**********************************************************************************************
    async register(req, res) {
        console.log("body", req.body);
        console.log("files are", req.file);
        let userData = {
            uname: req.body.uname,
            email: req.body.email,
            lname: req.body.lname,
            pass: req.body.pass,
            image: req.file
        }
        try {
            let filePath = path.join("uploads", userData.uname, userData.image.originalname);
            console.log("path of the file", filePath);
            console.log("data from html is ", userData);
            const userDataBeingInserted = await signUpModel.insertUser(userData, filePath);
            folderUser = await createFolder(userData.uname)
            fileUser = await writeFile(userData.image.originalname, userData.image.buffer, userData.uname)
            console.log("user data from model to ctrller", userDataBeingInserted);
            res.cookie('user_id', userDataBeingInserted[0].user_id)
            res.redirect("/articles")
        } catch (err) {
            console.error("Error while register", err);
            res.status(401).json({ error: true, data: { message: err.message } });

        }

    },
    async login(req, res) {
        try {
            const email = req.body.email
            const pass = req.body.pass
            console.log("password is", pass);
            const loginVal = await model.loginVal(email, pass)
            if (!loginVal) {
                res.send("Invalid username or password")
            } else {
                res.cookie("user_id", loginVal[0].user_id)
                res.redirect("/articles")
            }
        } catch (err) {
            console.log("err in login", err);
        }

    }
}

function createFolder(folderName) {
    let promise1 = new Promise((resolve, rejects) => {
        let foldersPath = path.join(__dirname, "../", "uploads", folderName)
        console.log("Folder path", foldersPath);
        fs.mkdir(foldersPath, (err) => {
            if (err) {
                rejects("Folder Not created", err);
                return false;
            } // folderParent childFolder
            resolve(`folder created${foldersPath}`);
        })

    })
    return promise1
}

function writeFile(originalname, buffer, filesFolderName) {
    let promise2 = new Promise((resolve, rejects) => {
        let filepath = path.join(__dirname, "../", "uploads", filesFolderName, originalname); ////undefined ""../""
        fs.writeFile(filepath, buffer, (err) => {
            if (err) {
                rejects("File not created")
                return false
            }

            resolve(filepath);
        })
    })
    return promise2

}

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();
    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;
    const dateReturned = [day, month, year].join('-');
    return dateReturned
}