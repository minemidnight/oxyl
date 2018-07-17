module.exports = async function (_a, _b, _c, id) {
	return this.guild.channels.get.get(await id.run());
};
