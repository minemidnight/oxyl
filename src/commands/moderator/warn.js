module.exports = {
	process: async message => {
		let member = message.channel.guild.members.get(message.args[0].id);
		if(!member) return __("phrases.notInGuild", message);

		if(!member.punishable(message.member)) {
			return __("commands.moderator.warn.noPerms", message);
		} else {
			let warnCount = await bot.utils.warnMember(member, message.author, message.args[1]);
			return __("commands.moderator.warn.success", message, { user: member.user.username, warnCount });
		}
	},
	caseSensitive: true,
	guildOnly: true,
	perm: "banMembers",
	description: "Give a member a warning",
	args: [{ type: "user" }, {
		type: "text",
		label: "reason",
		optional: true
	}]
};
