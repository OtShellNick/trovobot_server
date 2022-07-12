const {updateUserByUserId} = require("../actions/userActions");
const {Errors: {MoleculerError}} = require('moleculer');
const {updateSettings} = require("../actions/settingsActions");

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
        update: {
            params: {
                userId: {type: 'string', optional: false},
                settings: {
                    type: 'object', optional: false, elements: {
                        botOn: {type: 'boolean', optional: false},
                        sendSelf: {type: 'boolean', optional: false},
                        triggers: {type: 'array', optional: false}
                    }
                }
            },
            handler: async ({params, meta}) => {
                const {userId, settings} = params;

                console.log('settings', settings);
                try {
                    const updatedUser = await updateUserByUserId(userId, {settings});
                    updateSettings(meta.user, settings);
                    return updatedUser;
                } catch (e) {
                    console.log('error update', e);
                    throw new MoleculerError('Internal server error', 500);
                }
            }
        }
    },

}