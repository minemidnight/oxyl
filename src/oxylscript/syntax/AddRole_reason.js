module.exports = (_a, _b, _c, role, _d, member, _e, reason) =>
	member.run().addRole(role.run().id, reason.run());
