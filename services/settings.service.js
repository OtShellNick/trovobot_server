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
                    const [settings] = await getSettingsByUserId(user.userId);
                    return settings;
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
                    let client = meta.chatClient;
                    const [settings] = await updateSettings(user.userId, {botOn});

                    if(settings.botOn) await chatConnect(user, meta);
                    if(!settings.botOn && client) chatDisconnect(client);

                    return settings;
                } catch (e) {
                    console.log('error settings update', e);
                    throw new MoleculerError('Internal server error', 500);
                }
            }
        }
    }
}