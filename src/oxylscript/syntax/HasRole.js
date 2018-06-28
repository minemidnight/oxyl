module.exports = (member, _a, _b, _c, role) =>
	!!~member.run().roles.indexOf(role.run().id);
