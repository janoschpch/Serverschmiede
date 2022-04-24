import { ButtonInteraction, MessageEmbed } from "discord.js";
import fs from "fs";

const { Modal, TextInputComponent, showModal } = require('discord-modals');
const validator = require('validator');

import { client } from "./Bot";

require('dotenv').config();

const PteroHelper = require("./util/PteroHelper");
const Messenger = require("./Messenger");

const users = require('../config/users.json');

exports.createAccount = (interaction: ButtonInteraction) => {
    let modal = new Modal()
        .setCustomId("create_account")
        .setTitle('Erstelle erst einen Account')
        .addComponents([
            new TextInputComponent()
                .setCustomId("create_account_email")
                .setLabel("E-Mail Addresse")
                .setStyle("SHORT")
                .setMinLength(6)
                .setPlaceholder("E-Mail Adresse")
                .setRequired(true),
            new TextInputComponent()
                .setCustomId("create_account_username")
                .setLabel("Benutzername")
                .setStyle("SHORT")
                .setMinLength(5)
                .setMaxLength(20)
                .setPlaceholder("Benutzername")
                .setRequired(true),
            new TextInputComponent()
                .setCustomId("create_account_firstname")
                .setLabel("Vorname")
                .setStyle("SHORT")
                .setPlaceholder("Vorname")
                .setRequired(true),
            new TextInputComponent()
                .setCustomId("create_account_lastname")
                .setLabel("Nachname")
                .setStyle("SHORT")
                .setPlaceholder("Nachname")
                .setRequired(true)
        ])

    showModal(modal, {
        client: client,
        interaction: interaction
    })
}

client.on("modalSubmit", async modal => {
    if (modal.customId === "create_account") {
        const email = modal.getTextInputValue("create_account_email");
        const username = modal.getTextInputValue("create_account_username");
        const firstname = modal.getTextInputValue("create_account_firstname");
        const lastname = modal.getTextInputValue("create_account_lastname");

        await modal.deferReply({ ephemeral: true });

        if (!validator.isEmail(email)) {
            modal.followUp({ content: "Bitte gebe eine gültige E-Mail Adresse an!"});
            return;
        }

        if (username.includes(" ")) {
            modal.followUp({ content: "Bitte gebe einen gültigen Benutzernamen an!" });
            return;
        }

        if (firstname.includes(" ")) {
            modal.followUp({ content: "Bitte gebe einen gültigen Vornamen an!" });
            return;
        }

        if (lastname.includes(" ")) {
            modal.followUp({ content: "Bitte gebe einen gültigen Nachnamen an!" });
            return;
        }

        const password = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);

        PteroHelper.createAccount(email, username, firstname, lastname, password, (result: any) => {
            if (result.success) {
                const embed = new MessageEmbed()
                    .setColor('#0099ff')
                    .setTitle('Account erstellt')
                    .setDescription('Dein Account wurde erfolgreich erstellt! Deine Zugangsdaten lauten:\n\nE-Mail: `' + email + '`\nBenutzername: `' + username + '`\nPasswort: ||' + password + '||\n\nDas Panel findest du unter ' + process.env.PTERODACTYL_BASE_URL)
                    .setFooter({ text: "Serverschmiede © 2022" });
                modal.followUp({ embeds: [embed] });
                linkAccount(modal.user.id, result.pterodactylUserId);

                Messenger.sendLogMessage("Neuer Pterodactyl Account wurde erstellt\n\nBenutzer: `" + modal.user.tag + "`\nE-Mail: `" + email + "`\nBenutzername: `" + username + "`\nVorname: `" + firstname + "`\nNachname: `" + lastname + "`\nPanel User ID: `" + result.pterodactylUserId + "`");
            } else {
                modal.followUp({ content: result.message });
            }
        });
        
    }
});

function linkAccount(discordUserId: string, panelUserId: number) {
    users.linkedAccounts.push({
        userId: discordUserId,
        pterodactylUserId: panelUserId
    });
    fs.writeFile('./config/users.json', JSON.stringify(users, null, 4), (err) => {
        if (err) {
            console.log(err);
        }
    });
}