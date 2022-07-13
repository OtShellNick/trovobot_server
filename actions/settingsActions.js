const {Bot} = require("../helpers/chat");

const BOTS = new Map();


const updateSettings = async (user, settings) => {
    const {botOn, sendSelf} = settings;

    console.log(BOTS);

    if(botOn && !BOTS.has(user.userId)) {
        const bot = new Bot({...user, settings});
        await bot.start();
        BOTS.set(user.userId, bot);
    } else {
        const bot = BOTS.get(user.userId);
        if(bot) {
            await bot.stop();
            BOTS.delete(user.userId);
        }
    }

    if(botOn && sendSelf !== user.settings.sendSelf) {
        const bot = BOTS.get(user.userId);

        if(bot) {
            await bot.stop();
            BOTS.delete(user.userId);
        }

        const newBot = new Bot({...user, settings});
        await newBot.start();
        BOTS.set(user.userId, newBot);
    }
}

module.exports = {updateSettings};