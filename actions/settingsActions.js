const {connect} = require('../db');
const {chatConnect, chatDisconnect, chatRestart} = require("../requests/chat");

let settings = null;

(async () => {
    if(!settings?.isConnected()) settings = (await connect()).collection('settings');
})()

const getSettingsByUserId = async (userId) => await settings.findOne({userId});

const updateSettings = async (userId, data) => {
    const {value} = await settings.findOneAndUpdate({userId}, {$set: data}, {returnDocument: 'after'});
    return value;
};

const createSettings = async (userId, data) => {
    return await settings.insertOne({userId, ...data});
}

const settingsUpdateAction = async (user, settings) => {
    const {botOn, sendSelf} = settings;

    if(user.botOn !== botOn) {
        if(botOn) {
            await chatConnect({...user, ...settings});
        } else {
            await chatDisconnect({...user, ...settings});
        }
    }

    if(user.botOn && user.sendSelf !== sendSelf) {
        await chatRestart({...user, ...settings});
    }
}

module.exports = {getSettingsByUserId, createSettings, updateSettings, settingsUpdateAction}