const {refreshToken} = require("../requests/auth");
const {updateUserByUserId, getUserByJwt} = require("../actions/userActions");


module.exports = {
    name: 'user',
    version: 1,
    actions: {
        me: {
            handler: async ({meta}) => {
                const {user} = meta;
                try {
                    const [foundUser] = await getUserByJwt(user.jwt);
                    meta.user = foundUser;
                    return foundUser;
                } catch (e) {
                    console.log('me err', e)
                }
            }
        },
        refresh: {
            params: {
                access_token: {type: 'string', optional: false}
            },
            handler: async ({params, meta}) => {
                const {access_token} = params;

                try {
                    const [user] = await getUserByJwt(access_token);
                    const {data: authData} = await refreshToken(user.refresh_token);
                    const [newUser] = await updateUserByUserId(user.userId, authData);
                    return newUser;
                } catch (e) {
                    console.log('error refresh token', e);
                }
            }
        }
    },

}