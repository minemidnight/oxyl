module.exports = async (member, _a, _b, role) =>
	!!~(await member.run()).roles.indexOf((await role.run()).id);
