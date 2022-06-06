const {refreshToken} = require("../requests/auth");
const {updateUserByUserId} = require("../actions/userActions");


module.exports = {
    name: 'user',
    version: 1,
    actions: {
        me: async ({meta}) => {
            const {user} = meta;
            const {data: authData} = await refreshToken(user.refresh_token);
            const [newUser] = await updateUserByUserId(user.userId, authData);
            meta.user = newUser;
            return newUser;
        },
    },

}