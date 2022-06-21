const {Errors: {MoleculerError}} = require('moleculer');
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

                    if(!foundUser) {
                        throw new MoleculerError('User not found', 404, 'NOT_FOUND');
                    }

                    meta.user = foundUser;
                    return foundUser;
                } catch (e) {
                    console.log('me err', e);
                    throw new MoleculerError('Internal server error', 500);
                }
            }
        },
        refresh: {
            params: {
                access_token: {type: 'string', optional: false}
            },
            handler: async ({params}) => {
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