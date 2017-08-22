const modLog = require("../../modules/modLog.js");
module.exports = {
	process: async message => {
		let kickPerms = message.channel.guild.members.get(bot.user.id).permission.has("kickMembers");
		if(!kickPerms) return __("commands.moderator.kick.noPerms", message);

		let member = message.channel.guild.members.get(message.args[0].id);
		if(!member) return __("phrases.notInGuild", message);

		if(!member.kickable) {
			return __("commands.moderator.kick.botCantKick", message, { user: member.user.username });
		} else if(!member.punishable(message.member)) {
			return __("commands.moderator.kick.youCantKick", message, { user: member.user.username });
		} else {
			if(message.args[1]) {
				let guild = message.channel.guild;
				let channel = await modLog.channel(guild);
				if(channel) {
					modLog.presetReasons[guild.id] = { mod: message.author, reason: message.args[1] };
				}
			}

			member.kick(message.args[1]);
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
