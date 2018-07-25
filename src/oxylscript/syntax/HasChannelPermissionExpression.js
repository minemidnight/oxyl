module.exports = async (member, _a, _b, _c, permission, _d, channel) =>
	(await channel.run()).permissionsOf(await member.run()).has(await permission.run());
