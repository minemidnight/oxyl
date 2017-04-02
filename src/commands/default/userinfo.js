module.exports = {
	process: async message => {
		let user = message.args[0] || message.author;
		let member = message.channel.guild.members.get(user.id);

		return `__**User**__: ${user.username}#${user.discriminator}\n` +
			`ID: ${user.id}\n` +
			`Avatar: <${user.avatarURL}>\n` +
			`Playing: ${member.game ? member.game.name : "Nothing"}\n` +
			`Status: ${member.status.toUpperCase()}\n` +
			`Join Date: ${bot.utils.formatDate(user.createdAt)}\n` +
			`Guild Join Date: ${bot.utils.formatDate(member.joinedAt)}`;
	},
	guildOnly: true,
	description: "View information about a user",
	args: [{
		type: "user",
		optional: "true"
	}]
};
