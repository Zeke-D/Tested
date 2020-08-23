const express = require('express');
const router = express.Router();
const v1 = require('./v1/v1_routes.js');

// Welcome message
router.get("/", (req, res) => {
    res.json({message: "Welcome to our API endpoint. Please target a version."});
});

router.use('/v1', v1);

module.exports = router;