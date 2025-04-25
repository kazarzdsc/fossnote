const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const { setAddressFromDiscordUID } = require('../../../databases/eleves');

function addressDialogFields() {
    let fieldNames = ["address", "pc", "state", "city", "land"]
    let fieldDisplayNames = ["Line d'addresse (Route/Rue/Place/Lieu dit)", "Code postal", "Région", "Ville", "Pays"]

    let ars = []
    let fields = []

    for (let i = 0; i < fieldNames.length; ++i) {
        let tmp = new TextInputBuilder()
            .setCustomId(`reg_${fieldNames[i]}`)
            .setLabel(fieldDisplayNames[i])
            .setStyle(fieldNames[i].includes("address") ? TextInputStyle.Paragraph : TextInputStyle.Short)
            .setRequired(true);
        fields.push(tmp);
        ars.push(new ActionRowBuilder().addComponents(tmp));
    }

    return {ars, fields}
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setaddress')
        .setDescription('Register your personal informations on fossnote.'),
    async execute(interaction) {
        var userId = interaction.user.id;
        
        const modal = new ModalBuilder()
            .setCustomId("reg_modal_step2")
            .setTitle("Informations personelles (étape 2/2)")
        const { ars, fields } = addressDialogFields()
        modal.addComponents(ars)

        interaction.showModal(modal);

        const submitted = await interaction.awaitModalSubmit({
            time: 60000,
            filter: i => i.user.id === interaction.user.id,
        }).catch(error => {
            console.error(error)
            return null
        })

        if (submitted) {
            const [address, postalcode, city, state, land] = [
                submitted.fields.getTextInputValue("reg_address"),
                submitted.fields.getTextInputValue("reg_pc"),
                submitted.fields.getTextInputValue("reg_city"),
                submitted.fields.getTextInputValue("reg_state"),
                submitted.fields.getTextInputValue("reg_land")
            ]
            await setAddressFromDiscordUID(userId, address, postalcode, city, state, land);
            submitted.reply("Information saved successfully.")
        }
    }
}