module.exports = (user, _a) => {
	user = user.run();

	return `${user.username}#${user.discriminator}`;
};
