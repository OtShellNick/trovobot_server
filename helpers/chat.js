const {getUserByUserId, updateUserByUserId} = require("../actions/userActions");
const {
    getSelfChatToken,
    getChatToken,
    sendSelfMessage,
    sendMessage,
    getChatterByChatterId, createChatter, updateChatter
} = require("../actions/chatActions");
const {refreshToken} = require("../requests/auth");
const WebSocketClient = require('websocket').w3cwebsocket;

class Bot {
    constructor(user) {
        this.user = user;
        this.pongInterval = null;
    }

    async #setBot() {
        const {settings} = this.user;

        if (!settings.sendSelf) {
            return this.bot = await getUserByUserId('110378567');
        }

        this.bot = this.user;
    }

    async #setChatToken() {
        const {settings, channelId} = this.user;
        const {access_token, refresh_token, userId} = this.bot;
        try {
            const action = settings.sendSelf ? getSelfChatToken : getChatToken;
            const {data: {token}} = await action(access_token, channelId);
            this.chatToken = token;
        } catch (e) {
            console.log('error set token', e);
            const {data: authData} = await refreshToken(refresh_token);
            this.user = await updateUserByUserId(userId, authData);
            await this.#setChatToken();
        }
    }

    #auth() {
        const {chatToken, client} = this;
        client.onopen = () => {

            client.send(JSON.stringify({
                "type": "AUTH",
                "nonce": "erfgthyjuikjmuhngb",
                "data": {
                    "token": chatToken
                }
            }));

            client.send(JSON.stringify({
                    "type": "PING",
                    "nonce": "PING_randomstring"
                })
            );
        }
    }

    async #messagesHandler() {
        const {client} = this;
        client.onmessage = (message) => {
            const {type, data} = JSON.parse(message.data);

            switch (type) {
                case "PONG":
                    console.log('pong');
                    this.#pongHandler(data);
                    break;
                case "CHAT":
                    const {chats} = data;
                    if (chats.length < 50) this.#messageHandler(chats);
                    break;
            }
        }
    }

    #pongHandler(data) {
        if (this.pongInterval) clearInterval(this.pongInterval)
        this.pongInterval = setInterval(() => {
            this.client.send(JSON.stringify({
                    "type": "PING",
                    "nonce": "PING_randomstring"
                })
            )
        }, data.gap * 1000);
    }

    #messageHandler(chats) {
        chats.map(async (chat) => {
            const {type, nick_name, sender_id, roles} = chat;
            switch (type) {
                case 0:
                    await this.#updateChatter({sender_id, nick_name, roles});
                    this.#checkTriggers(chat, 'message');
                    break;
                case 5004:
                    this.#checkTriggers(chat, 'welcome');
                    break;
                case 5003:
                    this.#checkTriggers(chat, 'follow');
            }
        });
    };

    #checkTriggers(chat, action) {
        const {content, nick_name} = chat;
        let {settings: {triggers}} = this.user;

        triggers = triggers.filter(trigger => trigger.action === action);

        console.log('triggers', triggers);
        console.log('content', content);

        triggers.map(async (trigger) => {
            if(trigger.action === 'message') {
                if (content === trigger.command) {
                    await this.#sendMessage(trigger.message);
                }
            } else if (trigger.action === 'welcome') {
                const welcomeMessage = trigger.message.replace('{nickName}', nick_name);
                await this.#sendMessage(welcomeMessage);
            } else if (trigger.action === 'follow') {
               const followMessage = `@${nick_name} спасибо за подписку! :purpleheart Добро пожаловать в семью!`;
               await this.#sendMessage(followMessage);
            }
        });
    };

    async #sendMessage(message) {
        const {settings: {sendSelf}, channelId} = this.user;
        const {access_token} = this.bot;
        console.log('sendSelf', sendSelf);
        const action = sendSelf ? sendSelfMessage : sendMessage;

        try {
            await action(access_token, message, channelId);
        } catch (e) {
            console.log('error send message', e);
            await this.#refreshAccessToken();
            await this.#sendMessage(message);
        }
    };

    async #updateChatter({sender_id, nick_name, roles}) {
        const {user} = this;
        const chatter = await getChatterByChatterId(sender_id);

        if (!chatter || chatter.channelId !== user.channelId) {
            return await createChatter({
                sender_id,
                nick_name,
                roles,
                channelId: user.channelId,
                messages: 1
            });
        } else {
            return await updateChatter(sender_id, user.channelId, {roles, messages: chatter.messages + 1});
        }
    }

    async #refreshAccessToken() {
        const {refresh_token, userId} = this.bot;
        const {data: authData} = await refreshToken(refresh_token);
        this.bot = await updateUserByUserId(userId, authData);
    }

    async start() {
        await this.#setBot();
        await this.#setChatToken();
        this.client = new WebSocketClient('wss://open-chat.trovo.live/chat');
        this.#auth();
        await this.#messagesHandler();
        console.log('bot started');
    }

    async stop() {
        this.client.close();
        clearInterval(this.pongInterval);
        console.log('bot stopped');
    }

    async restart() {
        await this.stop();
        await this.start();
    }
}

module.exports = {Bot};