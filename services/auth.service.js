const {login, revokeToken, loginBot} = require('../requests/auth');
const {Errors: {MoleculerError}} = require('moleculer');
const {getUserInfo} = require('../requests/user');
const {createUser, getUserByUserId, updateUserByUserId, getUserByJwt, getAllUsers} = require('../actions/userActions');
const {createSettings} = require("../actions/settingsActions");
const {getBotById, updateBotByUserId, createBot, deleteBotById} = require("../actions/botActions");
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
                        const updatedUser = await updateUserByUserId(finedUser.userId, authData);

                        meta.user = updatedUser;
                        return updatedUser.jwt;
                    }

                    const createdUser = await createUser({...user, ...authData});
                    await createSettings(createdUser.userId, {botOn: false, triggers: [...TRIGGERS]});

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
                    await revokeToken(finedUser.access_token);
                } catch (e) {
                    console.log('error logout', e);
                    if (e.response.data.status === 11714) return 'Success';

                    throw new MoleculerError('Internal server error', 500);
                }

                return 'Success';
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
        },
        bot: {
            params: {
                userId: {type: 'string', optional: false},
                botCode: {type: 'string', optional: false}
            },
            handler: async ({params}) => {
                const {userId, botCode} = params;

                try {
                    const {data: authData} = await loginBot(botCode);
                    const {data: bot} = await getUserInfo(authData.access_token);
                    const finedBot = await getBotById(bot.userId);

                    if (finedBot) {
                        await updateBotByUserId(bot.userId, authData);

                        return new MoleculerError('Bot Already Registered', 403);
                    }

                    const {insertedId} = await createBot({...bot, ...authData});

                    await updateUserByUserId(userId, {customBot: insertedId.toString()});

                    return 'Success';
                } catch (e) {
                    console.log('login bot error', e);
                    throw new MoleculerError('Internal server error', 500)
                }
            }
        },
        disconnect: {
            params: {
                userId: {type: 'string', optional: false},
                customBot: {type: 'string', optional: false}
            },
            handler: async ({params}) => {
                const {userId, customBot} = params;

                try {
                    const bot = getBotById(customBot);
                    const user = await updateUserByUserId(userId, {customBot: null});
                    if (!bot) return 'Success';

                    await deleteBotById(customBot);

                    delete user._id;
                    delete user.jwt;
                    delete user.access_token;
                    delete user.refresh_token;
                    delete user.expires_in;
                    delete user.token_type;

                    return user;
                } catch (e) {
                    console.log('error bot disconnect', e);
                    throw new MoleculerError('Internal server error', 500)
                }
            }
        }
    },
}