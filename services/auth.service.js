const {login, revokeToken} = require('../requests/auth');
const {Errors: {MoleculerError}} = require('moleculer');
const {getUserInfo} = require('../requests/user');
const {createUser, getUserByUserId, updateUserByUserId, getUserByJwt} = require('../actions/userActions');
const {refreshTokenHandler} = require('../handlers/userHandler');
const {createSettings} = require("../actions/settingsActions");

let refreshInterval = 0;

module.exports = {
    name: 'auth',
    version: 1,
    actions: {
        login: {
            params: {
                authCode: {type: 'string', optional: false}
            },
            handler: async ({params, meta}) => {
                const {authCode} = params;
                try {
                    const {data: authData} = await login(authCode);
                    const {data: user} = await getUserInfo(authData.access_token);
                    const [findedUser] = await getUserByUserId(user.userId);

                    if (findedUser) {
                        const [updatedUser] = await updateUserByUserId(findedUser.userId, authData);
                        meta.user = updatedUser;

                        refreshTokenHandler(meta, updatedUser, refreshInterval);
                        return updatedUser;
                    }

                    const createdUser = await createUser({...user, ...authData});
                    await createSettings(createdUser.userId, {botOn: false});
                    refreshTokenHandler(meta, createdUser, refreshInterval)

                    meta.user = createdUser;
                    return createdUser;
                } catch (e) {
                    console.log('login error', e);
                    throw new MoleculerError('Internal server error', 500)
                }
            }
        },
        logout: {
            params: {
              jwt: {type: 'string', optional: false}
            },
            handler: async ({params}) => {
                const {jwt} = params;

                try {
                    const [findedUser] = await getUserByJwt(jwt);
                    await revokeToken(findedUser.access_token);
                    if(refreshInterval) clearInterval(refreshInterval);
                } catch (e) {
                    console.log('error logout', e);
                    throw new MoleculerError('Internal server error', 500)
                }

                return 'Success'
            }
        }
    },
}