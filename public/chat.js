$(function () {
    $("#messageArea").hide();
    $("#btn").click(function () {
        $("#userFormArea").hide();
        $("#messageArea").show();
    });
    var socket = io.connect();
    var $messageForm = $('#messageForm');
    var $message = $('#message');
    var $chat = $('#chat');
    var $messageArea = $('#messageArea');
    var $userFormArea = $('#userFormArea');
    var $userForm = $('#userForm');
    var $users = $('#users');
    var $username = $('#username');
    $messageForm.submit(function (e) {
        e.preventDefault();
        console.log('submitted');
        socket.emit('send message', $message.val());
        $message.val('');
    });
    socket.on('new message', function (data) {
        $chat.append('<div class="well"><strong>' + data.user + '</strong> : ' + data.msg + '</div>');
    })
    $userForm.submit(function (e) {
        e.preventDefault();
        console.log('submitted');
        socket.emit('new user', $username.val(), function (data) {
            if (data) {
                $userFormArea.hide();
                $messageArea.show();
            }
        });
        $username.val('');
    });
    socket.on('get users', function (data) {
        var html = '';
        for (i = 0; i < data.length; i++) {
            html += '<li class="list-group-item">' + data[i] + '</li>';
        }
        $users.html(html);
    });
});