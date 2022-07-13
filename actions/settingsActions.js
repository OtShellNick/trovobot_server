const {Bot} = require("../helpers/chat");

const BOTS = new Map();


const updateSettings = async (user, settings) => {
    const {botOn, sendSelf} = settings;

    console.log(BOTS.keys());

    if (botOn) {
        if(!BOTS.has(user.userId)) {
            const bot = new Bot({...user, settings});
            await bot.start();
            BOTS.set(user.userId, bot);
        }

        if(sendSelf !== user.settings.sendSelf) {
            const bot = BOTS.get(user.userId);
            await bot.stop();
            BOTS.delete(user.userId);

            const newBot = new Bot({...user, settings});
            await newBot.start();
            BOTS.set(user.userId, newBot);
        }
    } else {
        if(BOTS.has(user.userId)) {
            const bot = BOTS.get(user.userId);
            await bot.stop();
            BOTS.delete(user.userId);
        }
    }
}

module.exports = {updateSettings};