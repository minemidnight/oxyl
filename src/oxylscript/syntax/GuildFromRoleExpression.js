module.exports = async (_a, _b, _c, role) =>
	(await role.run()).guild;
