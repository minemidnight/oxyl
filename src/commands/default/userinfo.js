module.exports = {
	process: async message => {
		let user = message.args[0] || message.author;
		let member = message.channel.guild.members.get(user.id);

		return __("commands.default.userInfo.success", message, {
			user: `${user.username}#${user.discriminator}`,
			id: user.id,
			avatar: `<${user.avatarURL}>`,
			game: member.game ? member.game.name : __("words.none", message, {}, true),
			joinDate: bot.utils.formatDate(user.createdAt),
			guildJoin: bot.utils.formatDate(member.joinedAt),
			status: member.status.toUpperCase()
		});
	},
	guildOnly: true,
	description: "View information about a user",
	args: [{
		type: "user",
		optional: "true"
	}]
};
