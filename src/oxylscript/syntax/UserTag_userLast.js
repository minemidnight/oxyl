module.exports = (_a, user) => {
	user = user.run();

	return `${user.username}#${user.discriminator}`;
};
