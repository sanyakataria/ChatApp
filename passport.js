const passport = require('passport')
const localstrategy = require('passport-local').Strategy
const Facebookstrategy = require('passport-facebook')
const googlestrategy = require('passport-google-oauth2')
const users = require('./db').users
const bcrypt = require('bcrypt');

// it stores the username in the session
passport.serializeUser(function (user, done) {  
  done(null, user.username)
})

//it find outs the user based on the username stored in the the session
passport.deserializeUser(function (username, done) {    
  users.findOne({
    username: username
  }).then((user) => {
    if (!user) {
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
    if (!user) {
      return done(null, false, { message: "no such user" })
    }
    bcrypt.compare(password, user.password, (err, ismatch) => {
      if (ismatch) {
        return done(null, user);
      }
      else {
        return done(null, false);
      }
    })

  }).catch((err) => {
    return done(err)
  })
}))

//facebook login strategy
passport.use(
  new Facebookstrategy(
    {
      clientID: '339146903783606',
      clientSecret: '8ab4973134221e65d1ba67e3367b5d5a',
      callbackURL: 'http://localhost:9999/login/fb/callback',
    },
    (accessToken, refreshToken, profile, done) => {
      console.log("here2")
      users.findOrCreate({
        where: { username: profile.id },
        defaults:
        {
          username: profile.id,
          facebooktoken: accessToken,

        }
      })
        .then((user, created) => {
          done(null, user[0])
        })
        .catch(done)
    },
  ),
)

//google login strategy
passport.use(
  new googlestrategy(
    {
      clientID: '10934067192-bf7dpovp37a65t3t80o7v6e4gt0dreqh.apps.googleusercontent.com',
      clientSecret: 'jIN6KEdY7vOHv2GXga4UfT8w',
      callbackURL: 'http://localhost:9999/login/google/callback',
    },
    (accessToken, refreshToken, profile, done) => {
      users.findOrCreate({
        where: { username: profile.id },
        defaults:
        {
          username: profile.id,
        }
      })
        .then((user, created) => {
          done(null, user[0])
        })
        .catch(done)
    },
  ),
)

exports = module.exports = passport