const {connect} = require('../db');

let chatters = null;

(async () => {
    if(!chatters?.isConnected()) chatters = (await connect()).collection('chatters');
})()

const createChatter = async (data) => {
    return await chatters.insertOne(data);
}

const updateChatter = async (sender_id, channelId, data) => {
    const {value} = await chatters.findOneAndUpdate({sender_id, channelId}, {$set: data}, {returnDocument: 'after'});
    return value;
}

const getChatterByChatterId = async (sender_id) => {
    return await chatters.findOne({sender_id});
}

const getChattersWithMaxMessages = async () => {
    return await chatters.find().sort({messages: -1}).limit(1);
}

const getChattersWithRole = async (role) => {
    return await chatters.find({roles: {$all: [`${role}`]}}).limit(1);
}

module.exports = {createChatter, updateChatter, getChattersWithMaxMessages, getChatterByChatterId, getChattersWithRole}
