module.exports = (member, _a, _b, _c, _d, permission, _e, channel) =>
	channel.run().permissionsOf(member.run()).has(permission.run());
