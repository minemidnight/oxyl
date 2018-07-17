module.exports = async (_a, _b, role, _c, member) => {
	await member.removeRole((await role.run()).id);
	return;
};
