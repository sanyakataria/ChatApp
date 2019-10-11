var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server);
var path = require('path');

users = [];
connections = [];

app.set('view engine','hbs');

app.use(express.json())
app.use(express.urlencoded(({ extended: true })))

app.use(express.static(__dirname + '/public'))

app.get('/', (req,res) => {
    res.render('index');
})

io.on('connection', function(socket){
    connections.push(socket);
    console.log("connected: %s socket(s) connected", connections.length);

    //Disconnect
    socket.on('disconnect', function(data){
        users.splice(users.indexOf(socket.username), 1)
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
        users.push(socket.username);
        updateUsernames();
    })

    function updateUsernames(){
        io.emit('get users', users);
    }
})

server.listen(9999, () =>{
    console.log("server running.... on http://localhost:9999/ ");
});