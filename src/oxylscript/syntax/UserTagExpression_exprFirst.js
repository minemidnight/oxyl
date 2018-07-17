module.exports = async (user, _a) => {
	user = await user.run();
	return `${user.username}#${user.discriminator}`;
};
