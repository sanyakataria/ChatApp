const route = require('express').Router()
const users = require('../db').users
const passport = require('../passport');
const bcrypt = require('bcrypt');

route.get('/login', (req, res) => {
    res.render('login')
})

route.get('/signup', (req, res) => {
    res.render('signup')
})

route.get('/chat', (req, res) => {
    res.render('chat')
})

route.post('/login', passport.authenticate('local', {
    failureRedirect: '/login',
    successRedirect: '/chat'
}))

route.post('/signup', (req, res) => {
    var userpassword = req.body.password;
    bcrypt.hash(userpassword, 10, (err, hash) => {
        users.create({
            username: req.body.username,
            password: hash,
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email
        }).then((createduser) => {
            res.redirect('/login')
        })
    });
})

function checkLoggedIn(req, res, next) {
    if (req.user) {
        console.log(req.user);
        console.log("req.user " + req.user.username)
        return next()
    }
    else {
        res.redirect('/login')
    }
}

exports = module.exports = route