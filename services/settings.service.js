const {Errors: {MoleculerError}} = require('moleculer');
const {updateSettings, settingsUpdateAction} = require("../actions/settingsActions");

module.exports = {
    name: 'settings',
    version: 1,
    actions: {
        update: {
            params: {
                botOn: {type: 'boolean', optional: false},
                sendSelf: {type: 'boolean', optional: false},
            },
            handler: async ({params, meta}) => {
                const {user} = meta;
                const {botOn, sendSelf} = params;

                console.log('update settings', params);
                try {
                    const settings = await updateSettings(user.userId, {botOn, sendSelf});

                   await settingsUpdateAction(user, settings);

                    return settings;
                } catch (e) {
                    console.log('error settings update', e);
                    throw new MoleculerError('Internal server error', 500);
                }
            }
        }
    }
}