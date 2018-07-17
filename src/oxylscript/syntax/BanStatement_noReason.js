module.exports = async (_a, _b, member) => {
	await (await member.run()).ban(7);
	return;
};
