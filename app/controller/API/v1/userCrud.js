const express = require('express');
const { db, errorHandlerCreator } = require('../../../model/db/db.js');
const router = express.Router();



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
router.post('/', async (req, res) => {
    const { 
        body: {
            firstName,
            lastName,
            email,
            phone,
            password
        }
    } = req;
   
});

// update one user


// delete one user


module.exports = router;