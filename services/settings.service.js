const {Errors: {MoleculerError}} = require('moleculer');
const {getSettingsByUserId} = require("../actions/settingsActions");

module.exports = {
    name: 'settings',
    version: 1,
    actions: {
        get: {
            handler: async ({meta}) => {
                const {user} = meta;

                try {
                    const settings = getSettingsByUserId(user.userId);
                    console.log(settings);
                } catch (e) {
                    console.log('get settings error', e);
                    throw new MoleculerError('Internal server error', 500);
                }
            }
        },

    }
}