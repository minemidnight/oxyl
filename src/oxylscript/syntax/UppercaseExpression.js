module.exports = async (_a, string) =>
	(await string.run()).toUpperCase();
