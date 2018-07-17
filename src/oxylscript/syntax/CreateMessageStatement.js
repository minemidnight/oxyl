module.exports = async function(_a, _b, _c, content) {
	await this.data.channel.createMessage(await content.run());
	return;
};
