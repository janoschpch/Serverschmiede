import { TextChannel, MessageEmbed, MessageActionRow, MessageButton, Interaction } from "discord.js";

const { Modal, TextInputComponent, showModal } = require('discord-modals');

import { client } from "./Bot";

const Messenger = require("./Messenger");

export async function requestServerType(interaction: Interaction) {
    let modal = new Modal()
        .setCustomId("request_server_type_modal")
        .setTitle('Frage einen Server Typ an')
        .addComponents([
            new TextInputComponent()
                .setCustomId("request_server_type_modal_name")
                .setLabel("Name")
                .setStyle("SHORT")
                .setPlaceholder("Name")
                .setRequired(true),
            new TextInputComponent()
                .setCustomId("request_server_type_modal_description")
                .setLabel("Beschreibung")
                .setStyle("LONG")
                .setPlaceholder("Beschreibe deinen Server Typ...")
                .setRequired(true)
        ])

    showModal(modal, {
        client: client,
        interaction: interaction
    })
}

client.on("modalSubmit", async modal => {
    if (modal.customId === "request_server_type_modal") {
        let name = modal.getTextInputValue("request_server_type_modal_name");
        let description = modal.getTextInputValue("request_server_type_modal_description");

        await modal.deferReply({ ephemeral: true });

        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Anfrage wurde gesendet')
            .setDescription('Deine Anfrage wurde gesendet!\n\nName: `' + name + '`\nBeschreibung: `' + description + '`')
            .setFooter({ text: "Serverschmiede © 2022" });
        modal.followUp({ embeds: [embed] });

        Messenger.sendLogMessage(`Neue Server Typ Anfrage\n\nVon: \`${modal.user.tag}\`\nName: \`${name}\`\nBeschreibung: \`${description}\``);
    }
});