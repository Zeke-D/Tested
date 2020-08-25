const express = require('express');
const { User, Name } = require("../../../model/user.js");
const { hashPassword } = require('../../../helpers/authHelpers');
const router = express.Router();

// read one user
router.get('/:id', async (req, res, next) => {
    const { params: { id }} = req; // same as 'const id = req.params.id;'

    User.find(id)
    .then(result => res.json({user: result}))
    .catch(err => next(err));
    
});

// create one user
router.post('/', async (req, res, next) => {
    let { firstName, lastName, email, phone, password } = req.body.user;
    const user = new User(
        new Name(firstName, lastName), phone, email, 
        await hashPassword(password));

    user.save()
    .then(response => res.json(response))
    .catch(err => next(err));
});

module.exports = router;