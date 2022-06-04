const {login, revokeToken} = require('../requests/auth');
const {getUserInfo} = require('../requests/user');
const {createUser, getUserByUserId, updateUserByUserId} = require('../actions/userActions');

module.exports = {
    name: 'auth',
    version: 1,
    actions: {
        login: {
            params: {
                authCode: {type: 'string', optional: false}
            },
            handler: async ({params}) => {
                console.log(params);
                const {authCode} = params;
                const {data: authData} = await login(authCode);
                const {data: user} = await getUserInfo(authData.access_token);
                const [findedUser] = await getUserByUserId(user.userId);

                if (findedUser) {
                    const [updatedUser] = await updateUserByUserId(findedUser.userId, authData);

                    return updatedUser;
                } //TODO refresh token
                const createdUser = await createUser({...user, ...authData});
                return createdUser;
            }
        },
        logout: {
            params: {
                access_token: {type: 'string', optional: false}
            },
            handler: async ({params}) => {
                const {access_token} = params;

                const {data} = await revokeToken(access_token);

                return 'Success'
            }
        }
    },
}