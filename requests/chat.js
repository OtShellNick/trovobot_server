const {Server} = require('../helpers/server');
const {} = require('../requests/auth');
const WebSocketClient = require('websocket').client;
let interval = 0;



const getChatToken = (access_token) => {
    return Server('get', 'chat/token', {}, access_token)
}

const sendMessage = (access_token, msg) => {
    return Server('post', 'chat/send', {content: msg}, access_token);
}

const chat = (access_token, oauth_token) => {
    console.log('access_token', access_token);
    const client = new WebSocketClient();

    client.connect('wss://open-chat.trovo.live/chat');

    client.on('connect', (socket) => {
        socket.send(JSON.stringify({
            "type": "AUTH",
            "nonce": "erfgthyjuikjmuhngb",
            "data": {
                "token": access_token
            }
        }));

        socket.send(JSON.stringify({
                "type": "PING",
                "nonce": "PING_randomstring"
            })
        );

        socket.on('message', msg => {
            const messages = JSON.parse(msg.utf8Data);

            messagesHandler(messages, socket, oauth_token);
        })
    });
}

const messagesHandler = (data, socket, access_token) => {
    switch (data.type) {
        case 'CHAT':
            const {chats} = data.data;
            chats.forEach(msgs => {
                const {type, nick_name} = msgs;
                switch (type) {
                    case 5004:
                        const message = `@${nick_name}, добро пожаловать на канал! :shocked`
                        sendMessage(access_token, message);
                }
            });
            break;
        case 'PONG':
            console.log('pong')
            const {gap} = data.data;
            pingHandler(gap, socket);
            break;
    }
}

const pingHandler = (sec, socket) => {
    if(interval) clearInterval(interval)
    interval = setInterval(() => {
        socket.send(JSON.stringify({
                "type": "PING",
                "nonce": "PING_randomstring"
            })
        )
    }, sec * 1000);
}

module.exports = {getChatToken, chat}