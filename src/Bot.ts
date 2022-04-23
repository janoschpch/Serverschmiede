import { Client, TextChannel, MessageEmbed, MessageActionRow, MessageButton } from "discord.js";

const Modals = require('discord-modals');

require('dotenv').config();

export const client = new Client({
    intents: []
});

const Logger = require('./util/Logger');
const AccountCreator = require('./AccountCreator');
const ServerCreator = require('./ServerCreator');

const users = require('../config/users.json');

client.on('ready', () => {
    Logger.info(`Logged in as ${client.user?.tag}!`);

    resendMessage();
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;
    if (interaction.customId as string === 'create_server') {
       if (users.authorizedUsers.includes(interaction.user.id)) {
            var found = false;
            users.linkedAccounts.forEach((element: any) => {
                if (element.userId === interaction.user.id) {
                    found = true;
                    ServerCreator.createServer(interaction);
                }
            });
            if (!found) {
               AccountCreator.createAccount(interaction);
            }
       } else {
           interaction.reply({ content: "Dein Discord Account ist nicht berechtigt Server zu erstellen", ephemeral: true });
           Logger.info(`User ${interaction.user.tag} tried to create a server but is not authorized!`);
       }
    }
});

Modals(client);

async function resendMessage() {
    const channel = await client.channels.fetch(process.env.CREATE_SERVER_CHANNEL_ID as string) as TextChannel;
    await channel.bulkDelete(100, true);

    const embedMessage = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Server erstellen')
        .setDescription('Klicke auf den Button um einen Gameserver zu erstellen!')
        .setFooter({ text: "Serverschmiede © 2022" });

    const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId("create_server")
                .setEmoji("🎮")
                .setLabel("Server erstellen")
                .setStyle("SUCCESS")
        )

    channel.send({ embeds: [embedMessage], components: [row] });

    Logger.info(`Create Server message has been sent to #${channel.name}!`);
}

client.login(process.env.BOT_TOKEN);