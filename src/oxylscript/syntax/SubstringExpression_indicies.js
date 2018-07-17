module.exports = async (_a, _b, string, _c, from, _d, to) =>
	(await string.run()).substring(await from.run(), await to.run());
