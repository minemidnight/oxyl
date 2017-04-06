const modLog = require("../../modules/modLog.js");
module.exports = {
	process: async message => {
		let banPerms = message.channel.guild.members.get(bot.user.id).permission.has("banMembers");
		if(!banPerms) return "I am missing the permission to ban members!";

		let member = message.channel.guild.members.get(message.args[0].id);
		if(!member) return "Error: user not in server";

		let bannableBot = bot.utils.punishable(member, bot.user.id);
		let bannable = bot.utils.punishable(member, message.author.id);

		if(!bannableBot) {
			return `${member.user.username} couldn't be banned, because they have higher permisions than Oxyl`;
		} else if(!bannable) {
			return `${member.user.username} couldn't be banned, because they have higher permisions than you`;
		} else {
			if(message.args[1]) {
				let guild = message.channel.guild;
				let channel = await modLog.channel(guild);
				if(channel) {
					modLog.presetReasons[guild.id] = { mod: message.author, reason: message.args[1] };
				}
			}

			member.ban(7);
			return `${member.user.username} has been banned`;
		}
	},
	guildOnly: true,
	perm: "banMembers",
	description: "Ban a user from the guild",
	args: [{
		type: "user",
		label: "user"
	}, {
		type: "text",
		label: "reason",
		optional: true
	}]
};
