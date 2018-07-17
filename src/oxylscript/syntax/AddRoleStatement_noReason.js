module.exports = async (_a, _b, role, _c, member) => {
	await (await member.run()).addRole((await role.run()).id);
	return;
};
