const modLog = require("../modules/modLog");

module.exports = async (guild, member, oldMember, next, wiggle) => {
	const newRoles = member.roles.filter(roleID => !oldMember.roles.includes(roleID));
	if(!newRoles.length) return next();

	const { enabled, tracked } = await wiggle.locals.r.table("modLogSettings")
		.get(guild.id)
		.default({ enabled: false, tracked: [] })
		.pluck("enabled", "tracked")
		.run();

	if(!enabled || !tracked.length) return next();

	newRoles.filter(roleID => tracked.includes(roleID)).forEach(roleID => {
		modLog.addRole({
			punished: member.user,
			guild: member.guild,
			role: guild.roles.get(roleID)
		}, wiggle);
	});

	return next();
};
