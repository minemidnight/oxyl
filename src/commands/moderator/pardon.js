const modLog = require("../../modules/modLog.js");
module.exports = {
	process: async message => {
		let member = message.channel.guild.members.get(message.args[0].id);
		if(!member) return "Error: user not in server";

		let pardonable = bot.utils.isPunishable(member, message.author.id);
		if(!pardonable) {
			return "You do not have correct permission to pardon that user";
		} else {
			let warnings = await r.table("warnings").filter({
				guildID: message.channel.guild.id,
				userID: member.id
			}).run();
			let warnCount = warnings.length - 1;
			if(warnCount < 0) return "That member has no warnings";

			let channel = await modLog.channel(message.channel.guild.id);
			if(channel) {
				if(message.args[1]) {
					modLog.presetReasons[message.channel.guild.id] = { reason: message.args[1], mod: message.author };
				}
				await modLog.create(message.channel.guild, "pardon", member.user, { warnCount });
			}

			await r.table("warnings").get(warnings[warnings.length - 1].id).delete().run();
			return `Successfully pardoned ${member.user.username} (total warnings: ${warnCount})`;
		}
	},
	caseSensitive: true,
	guildOnly: true,
	perm: "banMembers",
	description: "Remove a warning from a member",
	args: [{ type: "user" }, {
		type: "text",
		label: "reason",
		optional: true
	}]
};
