module.exports = function(_a, _b, _c, _d, name) {
	name = name.run();

	return this.guild.roles.find(role => role.name.toLowerCase() === name.toLowerCase());
};
