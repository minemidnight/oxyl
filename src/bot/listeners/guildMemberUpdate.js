const modLog = require("../modules/modLog");

module.exports = async (guild, member, oldMember, next, wiggle) => {
	const newRoles = member.roles.filter(roleID => !~oldMember.roles.indexOf(roleID));
	if(!newRoles.length) return next();

	const { enabled, trackedRoles } = wiggle.locals.r.table("modLogSettings")
		.get(guild.id)
		.default({ enabled: false, trackedRoles: [] })
		.pluck("enabled", "trackedRoles")
		.run();

	if(!enabled || !trackedRoles.length) return next();

	newRoles.filter(roleID => ~trackedRoles.indexOf(roleID)).forEach(roleID => {
		modLog.addRole({
			punished: member.user,
			guild: member.guild,
			role: guild.roles.get(roleID)
		}, wiggle);
	});

	return next();
};
