const {getChatToken, chat, sendChatCommand, sendMessage} = require('../requests/chat');
const {getUserByJwt} = require("../actions/userActions");
const {getChatterByChatterId, createChatter, getChattersWithRole, updateChatter} = require("../actions/chatActions");

module.exports = {
    name: 'chat',
    version: 1,
    actions: {
        connect: {
            params: {
                access_token: {type: 'string', optional: false}
            },
            handler: async ({params, meta}) => {
                const {access_token} = params;
                const [user] = await getUserByJwt(access_token);

                const {data} = await getChatToken(user.access_token);
                meta.chat_token = data.token;
                chat(data.token, user.access_token);
                return data.token;
            }
        },
        token: {
            handler: async ({meta}) => {
                const {user} = meta;
                try {
                    const {data} = await getChatToken(user.access_token);

                    return data.token;
                } catch (e) {
                    console.log('refresh chat token error', e)
                }
            }
        },
        chatter: {
            handler: async ({params}) => {
                const {sender_id, nick_name, roles} = JSON.parse(decodeURI(params.data));

                try {
                    let [chatter] = await getChatterByChatterId(sender_id);

                    if (!chatter) {
                        chatter = await createChatter({sender_id, nick_name, roles, messages: 1});
                    }

                    return chatter;
                } catch (e) {
                    console.log('error get chatter', e);
                }
            }
        },
        role: {
            handler: async ({params}) => {
                const data = JSON.parse(params.data);

                try {
                    const [chatterWithRole] = await getChattersWithRole(data.role);

                    return chatterWithRole;
                } catch (e) {
                    console.log('error find most sociable user', e);
                }
            }
        },
        command: {
            handler: async ({meta, params}) => {
                const {user} = meta;
                const {command} = JSON.parse(params.data);

                const {data} = await sendChatCommand(user.access_token, command, 109186413);
                return data;
            }
        },
        updatechatter: {
            handler: async ({params}) => {
                console.log(params);
                const [updatedChatter] = await updateChatter(params.sender_id, params);
                return updatedChatter;
            }
        },
        send: {
            handler: async ({params, meta}) => {
                const {user} = meta;
                const {message} = params;

                await sendMessage(user.access_token, message);
            }
        }
    }
}