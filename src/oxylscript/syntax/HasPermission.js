module.exports = (member, _a, _b, _c, _d, permission) =>
	member.run().permission.has(permission.run());
