const modLog = require("../../modules/modLog.js");
module.exports = {
	process: async message => {
		let kickPerms = message.channel.guild.members.get(bot.user.id).permission.has("kickMembers");
		if(!kickPerms) return __("commands.moderator.kick.noPerms", message);

		let member = message.channel.guild.members.get(message.args[0].id);
		if(!member) return __("phrases.notInGuild", message);

		let kickableBot = bot.utils.isPunishable(member, bot.user.id);
		let kickable = bot.utils.isPunishable(member, message.author.id);

		if(!kickableBot) {
			return __("commands.moderator.kick.botCantBan", message, { user: member.user.username });
		} else if(!kickable) {
			return __("commands.moderator.kick.youCantBan", message, { user: member.user.username });
		} else {
			if(message.args[1]) {
				let guild = message.channel.guild;
				let channel = await modLog.channel(guild);
				if(channel) {
					modLog.presetReasons[guild.id] = { mod: message.author, reason: message.args[1] };
				}
			}

			member.kick();
			modLog.create(message.channel.guild, "kick", message.args[0]);
			return __("commands.moderator.kick.success", message, { user: member.user.username });
		}
	},
	caseSensitive: true,
	guildOnly: true,
	perm: "kickMembers",
	description: "Kick a user from the guild",
	args: [{ type: "user" }, {
		type: "text",
		label: "reason",
		optional: true
	}]
};
