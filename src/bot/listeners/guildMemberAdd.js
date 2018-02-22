module.exports = async (next, guild, member, { locals: { r } }) => {
	const { roles } = await r.table("roleSettings").get([guild.id, "autoRole"]).default({ roles: [] }).run();
	if(!roles.length) return next();

	roles.forEach(role =>
		member.addRole(role, "Autorole")
			.catch(err => {}) // eslint-disable-line no-empty-function, handle-callback-err
	);

	return next();
};
