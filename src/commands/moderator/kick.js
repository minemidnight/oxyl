const modLog = require("../../modules/modLog.js");
module.exports = {
	process: async message => {
		let kickPerms = message.channel.guild.members.get(bot.user.id).permission.has("kickMembers");
		if(!kickPerms) return "I am missing the permission to kick members!";

		let member = message.channel.guild.members.get(message.args[0].id);
		if(!member) return "Error: user not in server";

		let kickableBot = bot.utils.punishable(member, bot.user.id);
		let kickable = bot.utils.punishable(member, message.author.id);

		if(!kickableBot) {
			return `${member.user.username} couldn't be kicked, because they have higher permisions than Oxyl`;
		} else if(!kickable) {
			return `${member.user.username} couldn't be kicked, because they have higher permisions than you`;
		} else {
			if(message.args[1]) {
				let guild = message.channel.guild;
				let channel = await modLog.channel(guild);
				if(channel) {
					modLog.presetReasons[guild.id] = { mod: message.author, reason: message.args[1] };
				}
			}

			member.kick();
			return `${member.user.username} has been kicked`;
		}
	},
	guildOnly: true,
	perm: "kickMembers",
	description: "Kick a user from the guild",
	args: [{
		type: "user",
		label: "user id"
	}, {
		type: "text",
		label: "reason",
		optional: true
	}]
};
