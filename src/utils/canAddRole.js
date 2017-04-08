module.exports = (guild, role) => {
	let botMember = guild.members.get(bot.user.id);
	let rolePerms = botMember.permission.has("manageRoles");
	let highestRole = botMember.roles.length >= 1 ?
		botMember.roles.map(i => guild.roles.get(i)).sort((a, b) => b.position - a.position)[0] :
		guild.roles.get(guild.id);

	return highestRole.position > role.position && rolePerms;
};
