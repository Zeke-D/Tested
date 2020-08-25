const express = require('express');
const { User, Name } = require("../../../model/user.js");
const { hashPassword } = require('../../../helpers/authHelpers');
const router = express.Router();

// CRUD for users

// default result handler for user db query responses
const resultHandler = (response, result) => {
    response.json({users:result.rows})
};

// read one user
router.get('/:id', async (req, res, next) => {
    const { params: { id }} = req; // same as 'const id = req.params.id;'

    await User.find(id)
    .then(result => res.json({user: result}))
    .catch(err => next(err));
    
});

// create one user
router.post('/', async (req, res, next) => {
    let { firstName, lastName, email, phone, password } = req.body.user;
    const user = new User(
        new Name(firstName, lastName), phone, email, 
        await hashPassword(password));

    await user.save()
    .then(response => res.json(response))
    .catch(err => next(err));
});

module.exports = router;