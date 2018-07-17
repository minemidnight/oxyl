module.exports = async function (_a, _b, user) {
	return this.guild.members.get((await user.run()).id);
};
