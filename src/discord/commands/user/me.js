const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const eleves = require('../../../databases/eleves');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('me')
		.setDescription('Provides information about the user\'s fossnote account.'),
	async execute(interaction) {
		var userId = interaction.user.id;
		const user = await eleves.getUserByDiscordId(userId);
		if(!user) {
			await interaction.reply("Vous n'avez pas de compte fossnote. Utilisez `/register` pour créer un compte.")
		} else {
			user.ids.password = "*******";
			const notes = JSON.parse(user.notes)
			const embed = new EmbedBuilder()
				.setColor('Random')
				.setTitle('Vos informations personelles')
				.addFields(
					{name: "Nom", value: user.nom},
					{name: "Prénom", value: user.prenom},
					{name: "Classe", value: user.classe},
					{name: "Adresse", value: user.adresse1},
					{name: "Code Postal", value: user.codePostal},
					{name: "Ville", value: user.ville},
					{name: "Région", value: user.province},
					{name: "Pays", value: user.pays},
					{name: "Email", value: user.eMail},
					{name: "Nom d'utilisateur", value: user.ids.username},
					{name: "Note 1", value: notes[0] != undefined ? `DS ${notes[0].subject} ${notes[0].grade}/${notes[0].outof} coef. ${notes[0].coef} (${notes[0].commentary})` : "Non existente"},
					{name: "Note 2", value: notes[1] != undefined ? `DS ${notes[1].subject} ${notes[1].grade}/${notes[1].outof} coef. ${notes[1].coef} (${notes[1].commentary})` : "Non existente"},
					{name: "Note 3", value: notes[2] != undefined ? `DS ${notes[2].subject} ${notes[2].grade}/${notes[2].outof} coef. ${notes[2].coef} (${notes[2].commentary})` : "Non existente"},
					{name: "Note 4", value: notes[3] != undefined ? `DS ${notes[3].subject} ${notes[3].grade}/${notes[3].outof} coef. ${notes[3].coef} (${notes[3].commentary})` : "Non existente"},
				)

			await interaction.reply({embeds: [embed]});
		}
	},
};