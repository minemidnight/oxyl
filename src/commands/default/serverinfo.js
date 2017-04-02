module.exports = {
	process: async message => {
		let guild = message.channel.guild;
		let botCount = guild.members.filter(member => member.user.bot).length;
		let owner = guild.members.get(guild.ownerID).user;

		return `__**Guild**__: ${guild.name}\n` +
			`Channels: ${guild.channels.size}\n` +
			`Members: ${guild.memberCount}\n` +
			`Users: ${guild.memberCount - botCount} ` +
			`(${(((guild.memberCount - botCount) / guild.memberCount) * 100).toFixed(2)}%)\n` +
			`Bots: ${botCount} (${((botCount / guild.memberCount) * 100).toFixed(2)}%)\n` +
			`Creation Date: ${bot.utils.formatDate(guild.createdAt)}\n` +
			`Owner: ${owner.username}#${owner.discriminator} (ID: ${owner.id})\n` +
			`Icon: ${guild.iconURL ? `<${guild.iconURL}>` : "None"}`;
	},
	guildOnly: true,
	aliases: ["guildinfo"],
	description: "Get info about the guild this command was executed in"
};
