const {connect} = require('../db');

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

module.exports = {getSettingsByUserId, createSettings, updateSettings}