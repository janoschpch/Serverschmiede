import { Client, TextChannel, MessageEmbed, MessageActionRow, MessageButton } from "discord.js";

const Modals = require('discord-modals');

require('dotenv').config();

export const client = new Client({
    intents: []
});

const Logger = require('./util/Logger');
const AccountCreator = require('./AccountCreator');
const ServerCreator = require('./ServerCreator');
const Messenger = require('./Messenger');
const TypeRequester = require('./TypeRequester');

const users = require('../config/users.json');

client.on('ready', () => {
    Logger.info(`Logged in as ${client.user?.tag}!`);

    Messenger.sendCreateServerMessage();
    Messenger.sendAvailableEggsMessage();
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
            Logger.info(`User ${interaction.user.tag} tried to create a server but is not allowed!`);
        }
    }

    if (interaction.customId as string === 'request_server_type') {
        if (users.authorizedUsers.includes(interaction.user.id)) {
            TypeRequester.requestServerType(interaction);
        } else {
            interaction.reply({ content: "Dein Discord Account ist nicht berechtigt Server Typen anzufragen", ephemeral: true });
            Logger.info(`User ${interaction.user.tag} tried to request a server type but is not allowed!`);
        }
    }
});

Modals(client);

client.login(process.env.BOT_TOKEN);