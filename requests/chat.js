const {Server} = require('../helpers/server');
const {
    getChatterByChatterId,
    createChatter,
    updateChatter,
    getChattersWithMaxMessages, getChattersWithRole
} = require("../actions/chatActions");
const {refreshToken} = require("./auth");
const {updateUserByUserId} = require("../actions/userActions");
const {} = require('../requests/auth');
const WebSocketClient = require('websocket').w3cwebsocket;
let interval = 0;


const getChatToken = (access_token) => {
    return Server('get', 'chat/token', {}, access_token)
}

const sendMessage = (access_token, msg) => {
    return Server('post', 'chat/send', {content: msg}, access_token);
}

const sendChatCommand = (access_token, command, channel_id) => {
    return Server('post', 'channels/command', {command, channel_id}, access_token)
        .then(resp => {
            console.log('resp',resp)
            return resp
        });
}

const chat = (access_token, oauth_token) => {
    console.log('access_token', access_token);
    const client = new WebSocketClient('wss://open-chat.trovo.live/chat');

    client.onopen = ((socket) => {
        client.send(JSON.stringify({
            "type": "AUTH",
            "nonce": "erfgthyjuikjmuhngb",
            "data": {
                "token": access_token
            }
        }));

        client.send(JSON.stringify({
                "type": "PING",
                "nonce": "PING_randomstring"
            })
        );

        client.onmessage = (msg => {
            console.log(msg)
            // const messages = JSON.parse(msg.utf8Data);
            //
            // messagesHandler(messages, client, oauth_token);
        });
    });

    client.onclose = (() => {
        console.log('disconnected');
    })
}

const messagesHandler = (data, socket, access_token) => {
    switch (data.type) {
        case 'CHAT':
            const {chats} = data.data;
            if(chats.length < 50) chats.forEach(async (msgs) => {
                const {type, nick_name, sender_id, roles} = msgs;
                let message = '';

                switch (type) {
                    case 0:
                        let [chatter] = await getChatterByChatterId(sender_id);

                        if(!chatter) {
                            chatter = await createChatter({sender_id, nick_name, roles, messages: 1});
                        }

                        const [chatterWithRole] = await getChattersWithRole('Достоевский');

                        if(chatterWithRole && chatter.nick_name !== chatterWithRole.nick_name && chatter.roles && !chatter.roles.includes('streamer') && chatter.messages + 1 > chatterWithRole.messages) {
                                await sendChatCommand(access_token, `removerole Достоевский ${chatterWithRole.nick_name}`, 109186413);
                                const index = chatterWithRole.roles.findIndex(role => role === 'Достоевский');
                                chatterWithRole.roles.splice(index, 1);
                                await updateChatter(chatterWithRole.sender_id, {roles: chatterWithRole.roles});
                                const {data} = await sendChatCommand(access_token, `addrole Достоевский ${chatter.nick_name}`, 109186413);

                                if(data.is_success) sendMessage(access_token, `Поздравляем @${chatter.nick_name} с получением титула Достоевский, теперь ты признан самым общительным) @${chatterWithRole.nick_name} теряет лидерство, но вернуть то всегда есть шанс!`);
                        }

                        await updateChatter(sender_id, {roles, messages: chatter.messages + 1});
                        break;
                    case 5004:
                        message = `@${nick_name} добро пожаловать на канал! :shocked Устраивайся по удобнее, приятного просмотра)`
                        sendMessage(access_token, message);
                        break;
                    case 5003:
                        message = `@${nick_name} спасибо за подписку! :purpleheart Добро пожаловать в семью!`
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
    if (interval) clearInterval(interval)
    interval = setInterval(() => {
        socket.send(JSON.stringify({
                "type": "PING",
                "nonce": "PING_randomstring"
            })
        )
    }, sec * 1000);
}

const chatConnect = async (user) => {
    try {
        const {data: {token}} = await getChatToken(user.access_token);
        chat(token, user.access_token);
    } catch (e) {
        console.log('error connect to chat', String(e));
            const {data: authData} = await refreshToken(user.refresh_token);
            const [newUser] = await updateUserByUserId(user.userId, authData);
            chatConnect(newUser);
    }
}

const chatDisconnect = () => {
    if (interval) clearInterval(interval)
}

module.exports = {getChatToken, chat, sendChatCommand, sendMessage, chatConnect, chatDisconnect}