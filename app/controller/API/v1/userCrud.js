const express = require('express');
const { Client } = require('pg');

const client = new Client();
const router = express.Router();


client.connect();
// CRUD for users

// read all users
router.get('/', async (req, res) => {
    const query_res = await client.query('SELECT * from users');
    res.json({
        user:query_res
    });
});

// read one user
router.get('/:id', async (req, res) => {
    const query_res = await client.query('SELECT * from users WHERE id is $1::integer', [req.params.id]);
    res.json({
        user:query_res
    });
});

// create one user

// update one user


// delete one user


module.exports = router;