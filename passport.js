const passport = require('passport')
const localstrategy = require('passport-local').Strategy
const Facebookstrategy=require('passport-facebook')
const googlestrategy=require('passport-google-oauth2')
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

//facebook login strategy
passport.use(
    new Facebookstrategy(
      {
        clientID: '1017772708562909',
        clientSecret: '340388d156f720eed9cb6798f080da88',
        callbackURL: 'http://localhost:9999/login/fb/callback',
      },
      (accessToken, refreshToken, profile, done) => {
        console.log("here2")
        users.findOrCreate({where : {username : profile.id},
          defaults :
          {
            username : profile.id,
            facebooktoken: accessToken,
          
        }
        })
          .then((user,created) => {
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
        users.findOrCreate({where : {username : profile.id},
          defaults :
          {
            username : profile.id,
             }
        })
          .then((user,created) => {
            done(null, user[0])
          })
          .catch(done)
      },
    ),
  )

exports = module.exports = passport