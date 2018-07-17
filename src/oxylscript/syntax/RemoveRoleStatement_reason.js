module.exports = async (_a, _b, role, _c, member, _d, reason) => {
	await member.removeRole((await role.run()).id, await reason.run());
	return;
};
