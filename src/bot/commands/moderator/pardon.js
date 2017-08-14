const modLog = require("../../modules/modLog.js");
module.exports = {
	process: async message => {
		let member = message.channel.guild.members.get(message.args[0].id);
		if(!member) return __("phrases.notInGuild", message);

		if(!member.punishable(message.member)) {
			return __("commands.moderator.pardon.noPerms", message);
		} else {
			let warnings = await r.table("warnings")
				.getAll(member.id, { index: "userID" })
				.filter({ guildID: message.channel.guild.id }).run();
			let warnCount = warnings.length - 1;
			if(warnCount < 0) return __("commands.moderator.pardon.noWarnings", message);

			let channel = await modLog.channel(message.channel.guild);
			if(channel) {
				if(message.args[1]) {
					modLog.presetReasons[message.channel.guild.id] = { reason: message.args[1], mod: message.author };
				}
				await modLog.create(message.channel.guild, "pardon", member.user, { warnCount });
			}

			await r.table("warnings").get(warnings[warnings.length - 1].uuid).delete().run();
			return __("commands.moderator.pardon.success", message, { user: member.user.username, warnCount });
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
