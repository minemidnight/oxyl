module.exports = async function (_a, _b, _c, id) {
	return this.guild.roles.get(await id.run());
};
