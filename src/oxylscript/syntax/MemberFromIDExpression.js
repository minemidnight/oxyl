module.exports = async function (_a, _b, _c, id) {
	return this.guild.members.get(await id.run());
};
