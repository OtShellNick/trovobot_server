const {connect, ObjectId} = require('../db');

let bots = null;

(async () => {
    if(!bots?.isConnected()) bots = (await connect()).collection('bots');
})();

const createBot = async (data) => await bots.insertOne(data);

const getBotById = async (userId) => await bots.findOne({_id: ObjectId(userId)});

const updateBotByUserId = async (userId, data) => {
    const {value} = await bots.findOneAndUpdate({userId}, {$set: data}, {returnDocument: 'after'});
    return value;
}

const deleteBotById = async (botId) => await bots.findOneAndDelete({_id: ObjectId(botId)});

module.exports = {createBot, getBotById, updateBotByUserId, deleteBotById}