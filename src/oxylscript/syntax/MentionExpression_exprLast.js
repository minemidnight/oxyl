module.exports = async (_a, _b, mentionable) =>
	(await mentionable.run()).mention;
