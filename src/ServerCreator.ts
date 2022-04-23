import { ButtonInteraction, Interaction, MessageActionRow, MessageButton, MessageEmbed, MessageSelectMenu } from "discord.js";
import { client } from "./Bot";
import { eggs } from "./util/PteroServerHelper";

const PteroServerHelper = require("./util/PteroServerHelper");

const users = require('../config/users.json');

exports.createServer = async function(interaction: ButtonInteraction) {

    const embedMessage = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Wähle einen Servertyp')
        .setDescription('Wähle im unteren Dropdown einen Servertyp aus!')
        .setFooter({ text: "Serverschmiede © 2022" });

    var serverTypes = [];
    for (var i = 0; i < eggs.length; i++) {
        serverTypes.push({
            label: eggs[i].attributes.name,
            description: "",
            value: "create_server_type_id_" + eggs[i].attributes.id
        });
    }

    const row = new MessageActionRow()
        .addComponents(
            new MessageSelectMenu()
                .setCustomId("create_server_type")
                .setPlaceholder("Nichts ausgewählt")
                .addOptions(serverTypes),
        );

    interaction.reply({ embeds: [embedMessage], ephemeral: true, components: [row] });
}

client.on('interactionCreate', async interaction => {
    if (!interaction.isSelectMenu()) return;

    if (interaction.customId as string === 'create_server_type') {

        var eggId = interaction.values[0].split("_")[4];

        // @ts-ignore
        var egg = eggs.find(egg => egg.attributes.id == eggId);

        var serverName = egg.attributes.name + " - " + interaction.user.username + " - " + Math.random().toString(36).substring(2, 10);

        var pterodactylUserId;
        users.linkedAccounts.forEach((element: any) => {
            if (element.userId === interaction.user.id) {
                pterodactylUserId = element.pterodactylUserId;
            }
        });

        PteroServerHelper.createServer(serverName, pterodactylUserId, eggId, (result: any) => {
            if (result != null) {
                const embed = new MessageEmbed()
                    .setColor('#0099ff')
                    .setTitle('Server erstellt')
                    .setDescription('Dein Server wurde erfolgreich erstellt! Die Serverinformationen sind:\n\nName: `' + result.attributes.name + '`\n\nDas Panel findest du unter ' + process.env.PTERODACTYL_BASE_URL)
                    .setFooter({ text: "Serverschmiede © 2022" });

                interaction.reply({ embeds: [embed], ephemeral: true });
            } else {
                interaction.reply({ content: "Es ist ein Fehler aufgetreten! Versuche es später erneut!", ephemeral: true });
            }
        });
    }
})