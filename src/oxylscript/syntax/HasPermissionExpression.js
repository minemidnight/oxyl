module.exports = async (member, _a, _b, _c, permission) =>
	(await member.run()).permission.has(await permission.run());
