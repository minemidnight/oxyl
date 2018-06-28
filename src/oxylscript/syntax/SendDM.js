module.exports = (_a, _b, _c, _d, content, _e, user) => {
	user = user.run();

	user.getDMChannel().then(channel => channel.createMessage(content.run()));
};
