module.exports = async (_a, _b, _c, member, _d, nickname) => {
	await (await member.run()).edit({ nickname: await nickname.run() });
	return;
};
