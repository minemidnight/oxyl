module.exports = async channel => {
	if(channel.type !== 0) return;

	let rolePerms = channel.guild.members.get(bot.user.id).permission.has("manageChannel");
	if(!rolePerms) return;

	let mutedRole = channel.guild.roles.find(role => role.name.toLowerCase() === __("words.muted", channel.guild));
	if(mutedRole) bot.editChannelPermission(channel.id, mutedRole.id, 0, 2048, "role");
};
