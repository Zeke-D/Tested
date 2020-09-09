const express = require('express');
const { User, Name } = require("../../../model/user.js");
const { hashPassword, comparePass, auth } = require('../../../helpers/authHelpers');
const jwt = require('jsonwebtoken');
const validate = require('validator');
const user = require('../../../model/user.js');
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

    if(!validate.isEmail(email)){
        res.status(400).send({ error: 'Please enter a valid email' })
    }

    if(password.length < 8){
        res.status(400).send({ error: 'Password is too short, must be atleast 8 characters long' })
    }
    const user = new User(
        new Name(firstName, lastName), phone, email, 
        await hashPassword(password));

    user.save()
    .then(response => {
        const token = jwt.sign({ _id: email }, process.env.TOKEN_SECRET, {
            expiresIn: 3 * 24 * 60 * 60
        })
        res.header('auth-token', token).send('User successfully registered!')
        res.redirect('/home')
    })
    .catch(err =>{
        res.status(400).send(err.message)
        next(err)
    });
});

//logs user in 
router.post('/login', async (req, res, next) => {
    const { email, password } = req.body
    console.log(req.body)
    if(!password || !email){
        return res.status(400).send({ error: "Please fill out both fields" })
    } 
    const user = await User.findByEmail(email)
    .then(async response => {
        const rightCredentials = await comparePass(password, response.password)
        if(!rightCredentials){
            return res.status(400).send({ error: "Username or Password is incorrect" })
        }
        //token expires in 3 days
        const token = jwt.sign({ _id: response.email }, process.env.TOKEN_SECRET, {
            expiresIn: 3 * 24 * 60 * 60
        })
        res.header('auth-token', token);
        res.status(200).send({ success: "User logged in successfully!" })
    })
    .catch(err => next(err));
})

//gets user profile information
router.get('/', auth, async (req, res, next) => {
     await User.findByEmail(req.token._id)
    .then(response => {
        res.status(200).send({
            firstName: response.first_name,
            lastName: response.last_name,
            email: response.email,
            number: response.phone,
        })
    })
    .catch(err => next(err))
})

//allows user to change password
router.patch('/change-password', auth, async (req, res, next) => {
    let { password } = req.body
    if(password.length < 8) return res.status(401).send({ error: "Password must be atleast 8 characters" })
    password = await hashPassword(password)

    await User.updatePassword(req.user._id, password)
    .then(response => {
        res.status(200).send(res.json(response))
    })
    .catch(err => next(err))
})

//allows user to change phone number
router.patch('/change-number', auth, async (req, res, next) => {
    let { number } = req.body

    await User.updateNumber(req.user._id, number)
    .then(response => {
        return res.status(200).send(res.json(response))
    })
    .catch(err => next(err))
})

//logs user out by wiping away token
router.post("/logout", auth, (req, res, next) => {
    req.token = '';
    return res.header('auth-token', req.token).send({ message: 'Logged out' })
})


module.exports = router;