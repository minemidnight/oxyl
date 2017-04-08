const modLog = require("../../modules/modLog.js");
module.exports = {
	disabled: true,
	process: async message => {
		let member = message.channel.guild.members.get(message.args[0].id);
		if(!member) return "Error: user not in server";

		let warnable = bot.utils.isPunishable(member, message.author.id);
		if(!warnable) {
			return "You do not have correct permission to warn that user";
		} else {
			let warnCount = (await r.table("modLog").filter({
				action: "warning",
				guildID: message.channel.guild.id,
				userID: member.id
			})).length;
		}
	},
	guildOnly: true,
	perm: "banMembers",
	description: "Give a member a warning",
	args: [{ type: "user" }, {
		type: "text",
		label: "reason",
		optional: true
	}]
};
