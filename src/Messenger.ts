import { TextChannel, MessageEmbed, MessageActionRow, MessageButton, MessagePayload, MessageOptions } from "discord.js";

import { client } from "./Bot";
import { eggs } from "./util/PteroHelper";

require('dotenv').config();

const Logger = require('./util/Logger');

export async function sendCreateServerMessage() {
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

export async function sendAvailableEggsMessage() {
    const channel = await client.channels.fetch(process.env.LIST_EGGS_CHANNEL_ID as string) as TextChannel;
    await channel.bulkDelete(100, true);

    const embedMessage = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Verfügbare Server Typen')
        .setFooter({ text: "Serverschmiede © 2022" });
    var description = "";
    eggs.forEach((egg: any) => {
        description = description + "`" + egg.attributes.name + "`\n";
    });
    embedMessage.setDescription(description);

    const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId("request_server_type")
                .setEmoji("🎮")
                .setLabel("Server Typ anfragen")
                .setStyle("SUCCESS")
        )

    channel.send({ embeds: [embedMessage], components: [row] });

    Logger.info(`Available server eggs message has been sent to #${channel.name}!`);
}

export async function sendLogMessage(message: string) {
    const channel = await client.channels.fetch(process.env.LOG_CHANNEL_ID as string) as TextChannel;

    const embedMessage = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Log')
        .setDescription(message)
        .setFooter({ text: "Serverschmiede © 2022" });

    channel.send({ embeds: [embedMessage] });
}