
module.exports = {
    name: 'user',
    version: 1,
    actions: {
        me: {
            handler: async ({meta}) => {
                const {user} = meta;

                delete user._id;
                delete user.jwt;
                delete user.access_token;
                delete user.refresh_token;
                delete user.expires_in;
                delete user.token_type;

                return user;
            }
        },
    },

}