var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server);
var path = require('path');
const session = require('express-session');
const passport = require('./passport');
const { users, chats } = require('./db');

onlineusers = [];
connections = [];

app.set('view engine', 'hbs');

app.use(express.json())
app.use(express.urlencoded(({ extended: true })))

app.use(session({
    secret: "somesecretstring"  // secret is used to encode cookies
}))

app.use(passport.initialize())

app.use(passport.session())

app.use(express.static(__dirname + '/public'))

//google signin
app.get('/login/google', passport.authenticate('google', {
    scope:
        ['email', 'profile']
}
))
app.get('/login/google/callback', passport.authenticate('google', {
    successRedirect: '/chat',
    failureRedirect: '/login'
}))

//facebook signin
app.get('/login/fb', passport.authenticate('facebook'))
app.get('/login/fb/callback', passport.authenticate('facebook', {
    successRedirect: '/chat',
    failureRedirect: '/login'
}))


io.on('connection', function (socket) {
    connections.push(socket);
    console.log("connected: %s socket(s) connected", connections.length);

    //Disconnect
    socket.on('disconnect', function (data) {
        onlineusers.splice(onlineusers.indexOf(socket.username), 1)
        updateUsernames();
        connections.splice(connections.indexOf(socket), 1);
        console.log('disconnected: %s socket(s) disconnected', connections.length);
    });

    //Send Message
    socket.on('send message', function (data) {
        console.log(data);
        io.emit('new message', { msg: data, user: socket.username })
    });

    // new user
    socket.on('new user', function (data, callback) {
        callback(true);
        socket.username = data;
        onlineusers.push(socket.username);
        updateUsernames();
    })

    function updateUsernames() {
        io.emit('get users', onlineusers);
    }
})

app.use('/', require('./routes/route'))

server.listen(9999, () => {
    console.log("server running.... on http://localhost:9999/login ");
});
