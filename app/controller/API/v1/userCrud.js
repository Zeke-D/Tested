const express = require('express');
const { db, errorHandlerCreator } = require('../../../model/db/db.js');
const router = express.Router();
const {hashPassword} = require('../../../helpers/authHelpers.js');



// CRUD for users

// read all users
router.get('/', async (req, res) => {
    const query_res = await db.query('SELECT * from users');
    res.json({
        user:query_res
    });
});

// read one user
router.get('/:id', async (req, res, next) => {
    const { params: { id }} = req; // same as 'const id = req.params.id;'
    console.log(id);
    await db.query('SELECT * from users WHERE id = $1::integer', [id], errorHandlerCreator(res, next));
});

// create one user
router.post('/', async (req, res, next) => {

    const { firstName, lastName, email, phone } = req.body
    const password = await hashPassword(req.body.password)

    //query that adds user to db
    //error handler is fired off but data still gets entered into db... very weird
//     await db.query('INSERT INTO users (first_name, last_name, email, phone, password) VALUES ($1, $2, $3, $4, $5)',
//    [firstName, lastName, email, phone, password], errorHandlerCreator(res, next));
});

// update one user


// delete one user
router.delete('/', async (req, res, next) => {
    //TODO add delete user route
})


module.exports = router;