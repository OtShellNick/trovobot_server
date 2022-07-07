const {Errors: {MoleculerError}} = require('moleculer');
const {getSettingsByUserId, updateSettings} = require("../actions/settingsActions");
const {chatConnect, chatDisconnect} = require("../requests/chat");

module.exports = {
    name: 'settings',
    version: 1,
    actions: {
        get: {
            handler: async ({meta}) => {
                const {user} = meta;

                try {
                    return await getSettingsByUserId(user.userId);
                } catch (e) {
                    console.log('get settings error', e);
                    throw new MoleculerError('Internal server error', 500);
                }
            }
        },
        update: {
            params: {
                botOn: {type: 'boolean', optional: true}
            },
            handler: async ({params, meta}) => {
                const {user} = meta;
                const {botOn} = params;

                try {
                    const settings = await updateSettings(user.userId, {botOn});

                    settings.botOn ? await chatConnect(user) : chatDisconnect(user);

                    return settings;
                } catch (e) {
                    console.log('error settings update', e);
                    throw new MoleculerError('Internal server error', 500);
                }
            }
        }
    }
}