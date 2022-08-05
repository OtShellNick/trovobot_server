const {login, revokeToken} = require('../requests/auth');
const {Errors: {MoleculerError}} = require('moleculer');
const {getUserInfo} = require('../requests/user');
const {createUser, getUserByUserId, updateUserByUserId, getUserByJwt, getAllUsers, generateJwt} = require('../actions/userActions');
const {TRIGGERS} = require("../Defaults/defaultTriggers");

module.exports = {
    name: 'auth',
    version: 1,
    actions: {
        login: {
            params: {
                code: {type: 'string', optional: false}
            },
            handler: async ({params, meta}) => {
                const {code} = params;

                try {
                    const {data: authData} = await login(code);
                    const {data: user} = await getUserInfo(authData.access_token);
                    const finedUser = await getUserByUserId(user.userId);

                    if (finedUser) {
                        const jwt = generateJwt(finedUser.userId);
                        const updatedUser = await updateUserByUserId(finedUser.userId, {...authData, jwt});

                        meta.user = updatedUser;
                        return updatedUser.jwt;
                    }

                    const settings = {botOn: false, sendSelf:false, triggers: TRIGGERS};
                    const createdUser = await createUser({...user, ...authData, settings});

                    meta.user = createdUser;
                    return createdUser.jwt;
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
                    const finedUser = await getUserByJwt(jwt);
                    if(finedUser) await revokeToken(finedUser.access_token);
                    return 'Success';
                } catch (e) {
                    console.log('error logout', e);
                    if (e.response.data.status === 11714) return 'Success';

                    throw new MoleculerError('Internal server error', 500);
                }
            }
        },
        count: {
            handler: async () => {
                try {
                    const usersCount = await getAllUsers();

                    return {count: usersCount};
                } catch (e) {
                    console.log('error logout', e);
                    throw new MoleculerError('Internal server error', 500);
                }
            }
        }
    },
}