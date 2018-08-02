module.exports = async (member, _a, _b, role) =>
	!!(await member.run()).roles.includes((await role.run()).id);
