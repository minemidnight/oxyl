module.exports = {
	process: async message => {
		let guild = message.channel.guild;
		let botCount = guild.members.filter(member => member.user.bot).length;
		let owner = guild.members.get(guild.ownerID).user;

		return __("commands.default.serverInfo.success", message, {
			guild: guild.name,
			channels: guild.channels.size,
			members: guild.memberCount,
			users: guild.memberCount - botCount,
			userPercent: (((guild.memberCount - botCount) / guild.memberCount) * 100).toFixed(2),
			bots: botCount,
			botPercent: ((botCount / guild.memberCount) * 100).toFixed(2),
			creationDate: bot.utils.formatDate(guild.createdAt),
			owner: `${owner.username}#${owner.discriminator}`,
			ownerID: owner.id,
			icon: guild.iconURL ? `<${guild.iconURL}>` : __("words.none", message, {}, true)
		});
	},
	guildOnly: true,
	aliases: ["guildinfo"],
	description: "Get info about the guild this command was executed in"
};
