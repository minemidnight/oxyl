module.exports = async (_a, _b, member, _c, reason) => {
	await (await member.run()).ban(7, reason.run());
	return;
};
