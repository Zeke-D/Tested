const express = require('express');
const { db, errorHandlerCreator } = require('../../../model/db/db.js');
const router = express.Router();
const loginAuth = require('./loginAuth');
const jsonParser = bodyParser.json();

// CRUD for users

// read all users
router.get('/', async (req, res) => {
    const query_res = await db.query('SELECT * from users');
    res.json({
        users: query_res.rows
    });
});

// read one user
router.get('/:id', async (req, res, next) => {
    const { params: { id }} = req; // same as 'const id = req.params.id;'
    const resultHandler = (response, result) => {
        res.json({user:result.rows[0]})
    };
    await db.query(
        'SELECT * from users WHERE id = $1::integer', [id], 
        errorHandlerCreator(resultHandler, res, next));
});

// create one user
router.post('/', async (req, res, next) => {

    const { firstName, lastName, email, phone } = req.body
    const password = await loginAuth(req.body.password)

    //query that adds user to db
    //error handler is fired off but data still gets entered into db... very weird
    await db.query('INSERT INTO users (first_name, last_name, email, phone, password) VALUES ($1, $2, $3, $4, $5)',
   [firstName, lastName, email, phone, password], errorHandlerCreator(res, next));
});

// update one user
router.put('/:id', async (req, res, next) => {
    const { params: { id }, body } = req;
    const resHandler = (response, result) => {
        response.json({user:result.rows[0]})
    };
    await db.query(
        'SELECT * from users WHERE id = $1::integer', [id], 
        errorHandlerCreator(resHandler, res, next));
});


// delete one user


module.exports = router;