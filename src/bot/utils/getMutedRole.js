module.exports = async message => {
	const guild = message.channel.guild;
	let botMember = guild.members.get(bot.user.id);
	let mutedRole = guild.roles.find(role => role.name.toLowerCase() === __("words.muted", guild));

	if(mutedRole && !mutedRole.addable) {
		return __("commands.moderator.mute.roleError", message);
	} else if(!mutedRole) {
		let rolePerms = botMember.permission.has("manageRoles");
		let channelPerms = botMember.permission.has("manageChannels");
		if(!rolePerms && !channelPerms) {
			return __("commands.moderator.mute.missingBothPerms", message);
		} else if(!rolePerms) {
			return __("commands.moderator.mute.missingRolePerms", message);
		} else if(!channelPerms) {
			return __("commands.moderator.mute.missingChannelPerms", message);
		} else {
			mutedRole = await guild.createRole({
				name: __("words.muted", guild, {}, true),
				permissions: 0,
				color: 0xDF4242
			}, "Create Muted Role");
			// mutedRole.editPosition(0);

			guild.channels
				.filter(ch => ch.type === 0)
				.forEach(ch => ch.editPermission(mutedRole.id, 0, 2048, "role", "Configure Muted Role"));
			return mutedRole;
		}
	} else {
		return mutedRole;
	}
};
