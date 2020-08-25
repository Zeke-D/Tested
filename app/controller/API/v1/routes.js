const express = require('express');
const router = express.Router();
const userCrud = require('./userCrud');
const locationCrud = require('./locationCrud');

router.get('/', (req, res) => {
    res.json({
        message: 'Welcome to the API (v1)'
    });
});

router.use('/user', userCrud)
router.use('/locations', locationCrud)

module.exports = router;