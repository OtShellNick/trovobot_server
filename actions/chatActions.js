const {connect} = require('../db');
const {Server} = require("../helpers/server");

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

const getSelfChatToken = (access_token) => Server('get', 'chat/token', {}, access_token);

const getChatToken = (access_token, channelId) => Server('get', `chat/channel-token/${channelId}`, {}, access_token);

const sendSelfMessage = (access_token, msg) => Server('post', 'chat/send', {content: msg}, access_token);

const sendMessage = (access_token, msg, channelId) => Server('post', 'chat/send', {
    content: msg,
    channel_id: channelId
}, access_token);

module.exports = {createChatter, updateChatter, getChattersWithMaxMessages, getChatterByChatterId, getChattersWithRole, getChatToken, getSelfChatToken, sendMessage, sendSelfMessage};
