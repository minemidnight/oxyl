module.exports = async (_a, _b, user) => {
	user = await user.run();
	return `${user.username}#${user.discriminator}`;
};
