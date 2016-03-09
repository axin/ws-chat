var serverMessageTypes = require('./server-message-types');
var clientMessageTypes = require('./client-message-types');

var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({ port: 8090 });

var users = [];
var messages = [];

wss.broadcast = function(message) {
    wss.clients.forEach(function(client) {
        client.send(message);
    });
};

wss.on('connection', function(ws) {
    var currentUserName = null;

    ws.on('close', function() {
        removeElement(users, currentUserName);

        console.log(currentUserName + ' closed connection.');

        wss.broadcast(JSON.stringify({
            messageType: serverMessageTypes.USER_LEFT_CHAT,
            userName: currentUserName
        }));
        
        currentUserName = null;
    });

    ws.on('message', function(message) {
        var messageObject = JSON.parse(message);

        if (messageObject.messageType === clientMessageTypes.JOIN_CHAT) {
            const userName = messageObject.userName;

            if (users.indexOf(userName) === -1) {
                users.push(userName);
                currentUserName = userName;

                ws.send(JSON.stringify({
                    messageType: serverMessageTypes.JOIN_REQUEST_ACCEPTED,
                    userName: userName,
                    users: users.filter(function(user) {
                        return user !== userName;
                    }),
                    messages: messages
                }));

                wss.broadcast(JSON.stringify({
                    messageType: serverMessageTypes.NEW_USER_JOINED_CHAT,
                    userName: userName
                }));
            } else {
                ws.send(JSON.stringify({
                    messageType: serverMessageTypes.JOIN_REQUEST_REFUSED,
                    reason: 'User with this name has already joined the chat. Please choose another name.'
                }));
            }
        } else if (messageObject.messageType === clientMessageTypes.NEW_MESSAGE) {
            messages.push(JSON.parse(message));
            wss.broadcast(JSON.stringify(messageObject));
        }

        console.log('Received: ' + message + '.');
    });
});

function removeElement(array, element) {
    var index = array.indexOf(element);

    if (index > -1) {
        array.splice(index, 1);
    }
}