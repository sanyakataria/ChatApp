var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server);
var path = require('path');
const session = require('express-session');
const passport = require('./passport');
const {users,chats} = require('./db');

onlineusers = [];
connections = [];

app.set('view engine','hbs');

app.use(express.json())
app.use(express.urlencoded(({ extended: true })))

app.use(session({
    secret: "somesecretstring"  // secret is used to encode cookies
}))

app.use(passport.initialize())

app.use(passport.session())

app.use(express.static(__dirname + '/public'))

//app.use('/', require('./routes/route'))

// app.get('/', (req,res) => {
//     res.render('index');
// })

app.get('/login', (req,res) => {
    res.render('login')
})

app.get('/signup', (req, res) => {
    res.render('signup')
})

app.get('/chat', (req, res) => {
    res.render('chat')
})

app.post('/login', passport.authenticate('local', {
    failureRedirect: '/login',
    successRedirect: '/chat'
}))

app.post('/signup', (req, res) => {
    users.create ({
        username: req.body.username,
        password: req.body.password,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email
    }) .then((createduser) => {
        res.redirect('/login')
        //onlineusers = createduser.username;
    })
})

function checkLoggedIn(req, res, next) {
    if (req.user) {
        console.log(req.user);
        console.log("req.user "+req.user.username)
        return next()
    }
    else{
   res.redirect('/login')
  }}

//   app.post('/chatmessages',checkLoggedIn,(req,res)=>{
//     console.log(req.user.username)
//     if(req.body.task){
//     chats.create({
//         username:req.user.username,
//         message:req.body.message
//     }).then((message)=>{
//         chats.findAll({
//             where:{
//                 username:req.user.username, 
//             }
//         }).then((allmessage)=>{
//             res.json(allmessage)
//         })
//     })
//     }
//     else
//     {
//         chats.findAll({
//             where:{
//                 username:req.user.username, 
//             }
//         }).then((allmessage)=>{
//             res.json(allmessage)
//         })
//     }
// })

io.on('connection', function(socket){
    connections.push(socket);
    console.log("connected: %s socket(s) connected", connections.length);

    //Disconnect
    socket.on('disconnect', function(data){
        onlineusers.splice(onlineusers.indexOf(socket.username), 1)
        updateUsernames();
        connections.splice(connections.indexOf(socket), 1);
        console.log('disconnected: %s socket(s) disconnected', connections.length);
    });

    //Send Message
    socket.on('send message', function(data){
        console.log(data);
        io.emit('new message', {msg: data, user: socket.username})
    });

    // new user
    socket.on('new user', function(data, callback){
        callback(true);
        socket.username = data;
        onlineusers.push(socket.username);
        updateUsernames();
    })

    function updateUsernames(){
        io.emit('get users', onlineusers);
    }
})

server.listen(9999, () =>{
    console.log("server running.... on http://localhost:9999/login ");
});
