module.exports = async function (_a, _b, _c, name) {
	name = await name.run();

	return this.guild.roles.find(role => role.name.toLowerCase() === name.toLowerCase());
};
