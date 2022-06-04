const {getUserByAccessToken} = require('../actions/userActions');

module.exports = {
    name: 'user',
    version: 1,
    actions: {
        me: async ({meta}) => {
            const {access_token} = meta;

            const [findedUser] = await getUserByAccessToken(access_token);
            return findedUser;
        }
    },

}