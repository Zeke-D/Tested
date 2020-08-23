const express = require('express');
const { db, errorHandlerCreator } = require('../../../model/db/db.js');
const router = express.Router();
const { hashPassword } = require('../../helpers/authHelpers');

// CRUD for users

// default result handler for user db query responses
const resultHandler = (response, result) => {
    response.json({users:result.rows})
};

// read all users
router.get('/', async (req, res, next) => {
    const query_res = await db.query('SELECT * from users', [], 
        errorHandlerCreator(resultHandler, res, next));
});

// read one user
router.get('/:id', async (req, res, next) => {
    const { params: { id }} = req; // same as 'const id = req.params.id;'
    
    await db.query(
        'SELECT * from users WHERE id = $1::integer', [id], 
        errorHandlerCreator(resultHandler, res, next));
});

// create one user
router.post('/', async (req, res, next) => {
    let { firstName, lastName, email, phone, password } = req.body.user;
    password = await hashPassword(password);

    const resHandler = (response, query_result) => {
        response.json({
            message: "User succesfully added."
        });
    };

    //query that adds user to db
    //error handler is fired off but data still gets entered into db... very weird
    await db.query(
        'INSERT INTO users (first_name, last_name, email, phone, password)\
        VALUES ($1, $2, $3, $4, $5)',
        [firstName, lastName, email, phone, password],
        errorHandlerCreator(resHandler, res, next)
    );
});

// update one user
// TODO: Implement
router.put('/:id', async (req, res, next) => {
    const { params: { id }, body } = req;
    await db.query(
        'SELECT * from users WHERE id = $1::integer', [id], 
        errorHandlerCreator(resultHandler, res, next));
});


// delete one user
// TODO: determine if we want to implement

module.exports = router;