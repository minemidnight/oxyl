module.exports = async (_a, count, _b, string) =>
	(await string.run()).substring(0, await count.run());
