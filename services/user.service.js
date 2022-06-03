const {getUserByAccessToken} = require('../actions/userActions');

module.exports = {
    name: 'user',
    version: 1,
    actions: {
        me: async (ctx) => {
            const {access_token} = ctx.meta;

            return await getUserByAccessToken(access_token);
        }
    }
}