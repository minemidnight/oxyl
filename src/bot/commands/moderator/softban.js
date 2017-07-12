const modLog = require("../../modules/modLog.js");
module.exports = {
	process: async message => {
		let banPerms = message.channel.guild.members.get(bot.user.id).permission.has("banMembers");
		if(!banPerms) return __("commands.moderator.softban.noPerms", message);

		let member = message.channel.guild.members.get(message.args[0].id);
		if(!member) return __("phrases.notInGuild", message);

		if(!member.bannable) {
			return __("commands.moderator.softban.botCantBan", message);
		} else if(!member.punishable(message.member)) {
			return __("commands.moderator.softban.youCantBan", message);
		} else {
			if(message.args[1]) {
				let guild = message.channel.guild;
				let channel = await modLog.channel(guild);
				if(channel) {
					modLog.presetReasons[guild.id] = { mod: message.author, reason: message.args[1] };
				}
			}

			await member.ban(7, message.args[1]);
			member.unban("Softban");
			return __("commands.moderator.softban.success", message, { user: member.user.username });
		}
	},
	guildOnly: true,
	perm: "banMembers",
	description: "Softban a user from the guild (kick with message deletion)",
	args: [{ type: "user" }, {
		type: "text",
		label: "reason",
		optional: true
	}]
};
