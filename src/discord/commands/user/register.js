const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

const eleves = require('../../../databases/eleves');

function generateRegModalFields() {
    let fieldNames = ["name", "surname", "password",]
    let fieldDisplayNames = ["Nom", "Prénom", "Mot de passe"]
    
    let ars = []
    let fields = []

    for (let i = 0; i < fieldNames.length; ++i) {
        let tmp = new TextInputBuilder()
            .setCustomId(`reg_${fieldNames[i]}`)
            .setLabel(fieldDisplayNames[i])
            .setStyle(fieldNames.includes("address") ? TextInputStyle.Paragraph : TextInputStyle.Short)
            .setRequired(true);
        fields.push(tmp);
        ars.push(new ActionRowBuilder().addComponents(tmp));
    }

    return {ars, fields}
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('register')
        .setDescription('Register yourself on fossnote.'),
    async execute(interaction) {
        var fullUsername = interaction.user.tag;
        var userId = interaction.user.id;
        const user = await eleves.getUserByDiscordId(userId);
        if (user) {
            await interaction.reply("Vous avez déjà un compte fossnote, faites `/me` pour le constater.");
        } else {
            const userTag = fullUsername.split("#")[1];
            fullUsername = fullUsername.split("#")[0];
            fullUsername = fullUsername.replace(/[^\w\s]/gi, "").replace("_", "").replace("-", "").replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, "");
            fullUsername = fullUsername + userTag;
            const testUser = await eleves.getUser(fullUsername);
            if (testUser) {
                fullUsername += eleves.randomNumber(10, 999);
            }

            let modal = new ModalBuilder()
                .setCustomId("reg_modal")
                .setTitle("Informations personelles")
            const {ars,fields} = generateRegModalFields()
            modal.addComponents(ars);

            /*
            const finalUser = await eleves.createUserWithDiscord("DISCORD", capitalizeFirstLetter(fullUsername), fullUsername, userId);
            finalUser.ids.password = "*******";
            */

            await interaction.showModal(modal.toJSON());

            const submitted = await interaction.awaitModalSubmit({
                time: 60000,
                filter: i => i.user.id === interaction.user.id,
            }).catch(error => {
                console.error(error)
                return null
            })

            if (submitted) {

                const [name, surname, password] = [submitted.fields.getTextInputValue("reg_name"),submitted.fields.getTextInputValue("reg_surname"),submitted.fields.getTextInputValue("reg_password")]

                const finalUser = await eleves.createUserWithDiscord(name, surname, password, fullUsername, userId);

                await submitted.reply(`Utilisateur ${finalUser.ids.username} (${name} ${surname}) ajouté avec succès. Veuillez exécuter /registeradditionalinfos pour compléter votre profil.`);

            }
        }

    },
};