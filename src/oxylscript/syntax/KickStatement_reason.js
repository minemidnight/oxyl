module.exports = async (_a, _b, member, _c, reason) => {
	await (await member.run()).kick(await reason.run());
	return;
};
