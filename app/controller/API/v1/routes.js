const express = require('express');
const router = express.Router();
const userCrud = require('./userCrud');

router.get('/', (req, res) => {
    res.json({
        message: 'Welcome to the API (v1)'
    });
});

router.get('/user', userCrud)

module.exports = router;
