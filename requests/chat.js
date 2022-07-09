const {Server} = require('../helpers/server');
const {
    getChatterByChatterId,
    createChatter,
    updateChatter, getChattersWithRole
} = require("../actions/chatActions");
const {refreshToken} = require("./auth");
const {updateUserByUserId, getUserByUserId} = require("../actions/userActions");
const WebSocketClient = require('websocket').w3cwebsocket;
let interval = 0;
const map = new Map();

const getSelfChatToken = (access_token) => Server('get', 'chat/token', {}, access_token);

const getChatToken = (access_token, channelId) => Server('get', `chat/channel-token/${channelId}`, {}, access_token);

const setBotForUser = async user => {
    if (!user.sendSelf) {
        return await getUserByUserId('110378567');
    }

    return user;
}

const checkChatter = async ({nick_name, sender_id, roles, channelId}) => {

    let chatter = await getChatterByChatterId(sender_id);

    if (!chatter || chatter.channelId !== channelId) chatter = await createChatter({
        sender_id,
        nick_name,
        roles,
        channelId,
        messages: 1
    });

    return chatter;
};

const addMessageToChatter = async (chatter) => await updateChatter(chatter.sender_id, chatter.channelId, {messages: chatter.messages + 1});

const sendSelfMessage = (access_token, msg) => Server('post', 'chat/send', {content: msg}, access_token);

const sendMessage = (access_token, msg, channelId) => Server('post', 'chat/send', {
    content: msg,
    channel_id: channelId
}, access_token);

const sendChatCommand = (access_token, command, channel_id) => Server('post', 'channels/command', {
    command,
    channel_id
}, access_token)
    .then(resp => {
        console.log('resp', resp)
        return resp
    });

const messagesHandler = (data, socket, user, chatBot) => {
    const {access_token, refresh_token, userId} = chatBot;
    const sendAction = user.sendSelf ? sendSelfMessage : sendMessage;

    switch (data.type) {
        case 'CHAT':
            const {chats} = data.data;

            if (chats.length < 50) chats.forEach(async (msgs) => {
                const {type, nick_name, content, sender_id, roles} = msgs;
                console.log(msgs)

                let message = '';

                switch (type) {
                    case 0:
                        const chatter = await checkChatter({nick_name, sender_id, roles, channelId: user.channelId});
                        let updatedChatter = await addMessageToChatter(chatter);

                        user.triggers.map(async (trigger) => {
                            if (trigger.command === content) {
                                try {
                                    await sendAction(access_token, trigger.message, user.channelId);
                                } catch (e) {
                                    console.log('error send trigger message', e);
                                    const {data: authData} = await refreshToken(refresh_token);
                                    const newBot = await updateUserByUserId(userId, authData);
                                    await sendAction(newBot.access_token, message, user.channelId);
                                    chatRestart(user);
                                }
                            }
                        })

                        // const chatterWithRole = await getChattersWithRole('Достоевский');

                        // if (chatterWithRole && chatter.nick_name !== chatterWithRole.nick_name && chatter.roles && !chatter.roles.includes('streamer') && chatter.messages + 1 > chatterWithRole.messages) {
                        //     try {
                        //         await sendChatCommand(access_token, `removerole Достоевский ${chatterWithRole.nick_name}`, 109186413);
                        //         const index = chatterWithRole.roles.findIndex(role => role === 'Достоевский');
                        //         chatterWithRole.roles.splice(index, 1);
                        //         await updateChatter(chatterWithRole.sender_id, {roles: chatterWithRole.roles});
                        //         const {data} = await sendChatCommand(access_token, `addrole Достоевский ${chatter.nick_name}`, 109186413);
                        //
                        //         if (data.is_success) sendMessage(access_token, `Поздравляем @${chatter.nick_name} с получением титула Достоевский, теперь ты признан самым общительным) @${chatterWithRole.nick_name} теряет лидерство, но вернуть то всегда есть шанс!`);
                        //     } catch (e) {
                        //         console.log('error send role message', e);
                        //         const {data: authData} = await refreshToken(refresh_token);
                        //         const newUser = await updateUserByUserId(userId, authData);
                        //         chatRestart(newUser);
                        //     }
                        // }
                        //
                        // await updateChatter(sender_id, {roles, messages: chatter.messages + 1});
                        break;
                    case 5004:
                        message = `@${nick_name} добро пожаловать на канал! :shocked Устраивайся по удобнее, приятного просмотра)`
                        try {
                            await sendAction(access_token, message, user.channelId);
                        } catch (e) {
                            console.log('error send welcome message', e);
                            const {data: authData} = await refreshToken(refresh_token);
                            const newBot = await updateUserByUserId(userId, authData);
                            await sendAction(newBot.access_token, message, user.channelId);
                            chatRestart(user);
                        }
                        break;
                    case 5003:
                        message = `@${nick_name} спасибо за подписку! :purpleheart Добро пожаловать в семью!`
                        try {
                            sendMessage(access_token, message);
                        } catch (e) {
                            console.log('error send follow message', e);
                            const {data: authData} = await refreshToken(refresh_token);
                            const newBot = await updateUserByUserId(userId, authData);
                            await sendAction(newBot.access_token, message, user.channelId);
                            chatRestart(user);
                        }
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
    console.log('chatConnect', user)
    const chatBot = await setBotForUser(user);

    try {
        const action = user.sendSelf ? getSelfChatToken : getChatToken;
        const {data: {token}} = await action(chatBot.access_token, user.channelId);
        chat(token, user, chatBot);

    } catch (e) {

        console.log('error connect to chat', String(e));
        const {data: authData} = await refreshToken(chatBot.refresh_token);
        await updateUserByUserId(chatBot.userId, authData);
        await chatRestart(user);

    }
}

const chatDisconnect = async (user) => {
    const client = map.get(user.userId);
    if (interval) clearInterval(interval);
    if (client) await client.close();
    interval = 0;
}

const chatRestart = async (user) => {
    const newUser = await getUserByUserId(user.userId);
    await chatDisconnect(user);
    await chatConnect(newUser);
}

const chat = (access_token, user, chatBot) => {
    const {userId} = user;

    const client = new WebSocketClient('wss://open-chat.trovo.live/chat');

    client.onopen = (() => {
        client.send(JSON.stringify({
            "type": "AUTH",
            "nonce": "erfgthyjuikjmuhngb",
            "data": {
                "token": access_token
            }
        }));

        map.set(userId, client);

        client.send(JSON.stringify({
                "type": "PING",
                "nonce": "PING_randomstring"
            })
        );

        client.onmessage = (msg => {

            const messages = JSON.parse(msg.data);

            messagesHandler(messages, client, user, chatBot);
        });
    });

    client.onclose = (() => {
        console.log('disconnected');
    });
}

module.exports = {
    getChatToken,
    chat,
    sendChatCommand,
    sendMessage,
    chatConnect,
    chatDisconnect,
    getSelfChatToken,
    sendSelfMessage,
    chatRestart
}