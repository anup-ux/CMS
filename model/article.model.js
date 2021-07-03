const bcrypt = require('bcrypt');
const e = require('express');
const { json } = require('express');
const knex = require("knex")({
    client: "pg",
    connection: {
        host: "127.0.0.1",
        user: "postgres",
        password: "54321731",
        database: "cms",
    },
    pool: { min: 0, max: 5 },
});

module.exports = {
    insert(insertedData) {
        return knex("blogs").insert({ title: insertedData.title, content: insertedData.content, file: insertedData.file, slugs: insertedData.slugs, published_at: insertedData.date }).returning("*");
    },
    // knex.select('title', 'author', 'year').from('books')
    async getData(page, limit) {
        const offset = (page - 1) * limit
        const NumberOfArticles = await knex('blogs').count('*');
        const list = await knex.select('*').from('blogs').orderBy('title').limit(limit).offset(offset)
        return {
            totalNumber: NumberOfArticles,
            totalList: list
        }
    },
    dbQueryForId(idBeingPassed) {
        const getByIdQuery = knex('blogs').where('id', idBeingPassed)
        console.log("****************", idBeingPassed);
        return getByIdQuery

    },
    dbQueryForDelete(idForDelete) {
        const getByIdQueryForDelete = knex('blogs').where('id', idForDelete).del()
        return getByIdQueryForDelete
    },
    dbQueryForViewUpdate(iTdI) {
        const viewToBeUpdated = knex('blogs').where('id', iTdI)
        return viewToBeUpdated
    },
    updateControllerModel(dataBeingPassed) {
        // console.log(dataBeingPassed);
        const updatingBlogs = knex('blogs').where('id', parseInt(dataBeingPassed.parampassedForId)).update({
            // id: parseInt(dataBeingPassed.idPassedForUpDate),
            title: dataBeingPassed.title,
            content: dataBeingPassed.content,
            file: dataBeingPassed.file,
            slugs: dataBeingPassed.slugs,
            file: dataBeingPassed.path,
            published_at: dataBeingPassed.date
        })
        return updatingBlogs
    },
    updateControllerModelWithoutFile(dataPaseed) {
        const updatingWithoutFile = knex('blogs').where('id', parseInt(dataPaseed.parampassedForId)).update({
            // id: parseInt(dataBeingPassed.idPassedForUpDate),
            title: dataPaseed.title,
            content: dataPaseed.content,
            slugs: dataPaseed.slugs,
            published_at: dataPaseed.date

        })
        return updatingWithoutFile
    },
    updateSpecificField(theIdOfData, theDataForField) {
        const updatingField = knex('blogs').where({ 'id': theIdOfData }).update(theDataForField)
        return updatingField

    },
    async searchModel(idOrTitle) {
        console.log("the param passed", idOrTitle);
        console.log(typeof(idOrTitle));
        const testType = Number(idOrTitle)
        console.log(testType);
        if (Number.isNaN(testType)) {
            const result = await knex('blogs').where('title', 'ilike', `%${idOrTitle}%`)
            console.log("result1", result);
            return result;
        } else if (typeof(Number(testType)) === 'number') {
            const result = knex('blogs').where('id', parseInt(idOrTitle))
            console.log("2", result);
            return result;
        }

    },
    searchModel2(searchValAjax) {
        return knex('blogs').where('title', 'ilike', `%${searchValAjax}%`)
    },
    peginationModel(page, limit) {
        const offset = (page - 1) * limit
        return knex.select('*').from('blogs').orderBy('title').limit(limit).offset(offset)
    },

    // for (let i = 0; i <= useremail.length; i++) {
    //     if (useremail[i].email === emailcurr) {
    //         console.log("username", useremail[i].email);
    //         console.log(`${useremail[i].email} already exists`);
    //         return false
    //     } else {
    //            return knex("users").insert({ name: data.uname, email: data.email, mobile: data.phone, pass: hashPass }).returning("*");
    //     }

    // }



    async loginVal(loginemail, pass) {
        const loginVerify = await knex('users').where('email', loginemail).select('*')
        console.log("user data", loginVerify);
        if (loginVerify.length === 0) {
            console.log("invalid email");
        }
        try {
            const match = await bcrypt.compare(pass, loginVerify[0].pass);
            if (match) {
                console.log("sucess login");
            } else {
                console.log("failed password");
                return false
            }
        } catch (err) {
            console.log("err in login", err);
        }

        return loginVerify
    }
}