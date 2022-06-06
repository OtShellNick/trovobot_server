const {getChatToken, chat} = require('../requests/chat');
const {getUserByJwt} = require("../actions/userActions");

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
                console.log('chat user', access_token);

                const {data} = await getChatToken(user.access_token);
                meta.chat_token = data.token;
                chat(data.token, user.access_token);
                return data.token;
            }
        }
    }
}