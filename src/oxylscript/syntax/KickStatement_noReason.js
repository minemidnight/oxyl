module.exports = async (_a, _b, member) => {
	await (await member.run()).kick();
	return;
};
