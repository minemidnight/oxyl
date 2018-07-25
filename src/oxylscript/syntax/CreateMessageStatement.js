module.exports = async function(_a, _b, _c, content, _d, channel) {
	(await channel.run()).createMessage(await content.run());
	return;
};
