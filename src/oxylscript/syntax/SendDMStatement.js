module.exports = async (_a, _b, _c, content, _d, user) => {
	await (await (await user.run()).getDMChannel()).createMessage(await content.run());
	return;
};
