const {Errors: {MoleculerError}} = require('moleculer');
const {login} = require('../requests/auth');
const {getUserInfo} = require('../requests/user');
const {createUser, getUserByUserId} = require('../actions/userActions');

module.exports = {
    name: 'auth',
    version: 1,
    actions: {
        login: {
            params: {
                authCode: {type: 'string', optional: false}
            },
            handler: async ({meta, params}) => {
                console.log(params);
                const {authCode} = params;
                const {data: authData} = await login(authCode);
                const {data: user} = await getUserInfo(authData.access_token);
                const [findedUser] = await getUserByUserId(user.userId);

                if (findedUser) return findedUser; //TODO verify token && refresh token && update auth data
                const createdUser = await createUser({...user, ...authData});

                return createdUser;
            }
        }
    },
}