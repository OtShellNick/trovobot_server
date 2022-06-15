const {REST} = require('@discordjs/rest');
const {Client, Intents, GatewayIntentBits} = require('discord.js');
const {Routes, OAuth2Scopes, PermissionFlagsBits} = require("discord-api-types/v10");
console.log(GatewayIntentBits)
const {DISCORD_BOT_TOKEN, DISCORD_CLIENT_ID, DISCORD_GUILD_ID} = process.env;
const client = new Client({intents: [Intents.FLAGS.GUILDS]});

const commands = [
    {
        name: 'ping',
        description: 'Replies with Pong!',
    },
];

const rest = new REST({version: '10'}).setToken(DISCORD_BOT_TOKEN);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(Routes.applicationGuildCommands(DISCORD_CLIENT_ID, DISCORD_GUILD_ID), {body: commands});

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();

client.on('ready', () => {
    console.log('ready')
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'ping') {
        await interaction.reply('Pong!');
    }
});

client.login(DISCORD_BOT_TOKEN);