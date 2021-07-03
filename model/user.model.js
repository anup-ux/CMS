const bcrypt = require('bcrypt');
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
    async insertUser(data, path) {
        const email = data.email
        console.log("email", email);
        const useremail = await knex.select('email').from('users').where('email', email)
        try {
            if (useremail.length === 0) {
                const hashPass = await bcrypt.hash(data.pass, 10)
                console.log("inside if");
                const insertUser = knex("users").insert({ name: data.uname, lname: data.lname, email: data.email, image: path, pass: hashPass }).returning("*");
                return insertUser
            } else {
                console.log("user dupli");
            }

            // remove salt and put 10 as second para in hashpass which genrates salt and no of rounds

        } catch (err) {
            console.log("user already exists", err);
        }
    },
    getId(userId) {
        console.log("user id in model", userId);
        try {
            getbyUserId = knex('users').where('user_id', userId)
            return getbyUserId
        } catch (err) {
            console.log("err in getting user id", err);
            return false
        }
    }
}