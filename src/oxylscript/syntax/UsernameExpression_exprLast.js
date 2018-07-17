module.exports = async (_a, _b, user) =>
	(await user.run()).username;
