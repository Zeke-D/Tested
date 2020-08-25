const express = require('express');
const { User, Name } = require("../../../model/user.js");
const { hashPassword, comparePass } = require('../../../helpers/authHelpers');
const jwt = require('jsonwebtoken');
const router = express.Router();

// read one user
router.get('/:id', async (req, res, next) => {
    const { params: { id }} = req; // same as 'const id = req.params.id;'

    User.find(id)
    .then(result => res.json({user: result}))
    .catch(err => next(err));
    
});

// create one user
router.post('/register', async (req, res, next) => {
    let { firstName, lastName, email, phone, password } = req.body;
    const user = new User(
        new Name(firstName, lastName), phone, email, 
        await hashPassword(password));

    user.save()
    .then(response => res.json(response))
    .catch(err => next(err));
});

//logs user in 
router.post('/login', async (req, res, next) => {
    const { email, password } = req.body

    const user = await User.findByEmail(email)
    .then(async response =>{
        //made into a variale because async await 
        const rightCredentials = await comparePass(password, response.password)
        if(!rightCredentials){
            res.status(400).send({ error: "Invalid credentials" })
        }
        const token = jwt.sign({ _id: response.id }, process.env.TOKEN)
        // res.status(200).json(response)
        res.header('auth-token').send(token)
    })
    .catch(err => next(err));
})

module.exports = router;