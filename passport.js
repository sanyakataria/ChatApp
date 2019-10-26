const passport = require('passport')
const localstrategy = require('passport-local').Strategy
const users = require('./db').users

passport.serializeUser(function (user, done) {  // it stores the username in the session
    done(null, user.username)
})

passport.deserializeUser(function (username, done) {    //it find outs the user based on the username stored in the the session
    users.findOne({
        username: username
    }).then((user) => {
        if(!user) {
            return done(new Error("no such user"))
        }
        return done(null, user)
    }).catch((err) => {
        done(err)
    })
})

passport.use(new localstrategy((username, password, done) => {
    users.findOne({
        where: {
            username: username
        }
    }).then((user) => {
        if(!user) {
            return done(null, false, {message: "no such user"})
        }
        if(user.password !== password) {
            return done(null, false, {message: "wrong password"})
        }
        return done(null, user)
    }).catch((err) => {
        return done(err)
    })
}))

exports = module.exports = passport