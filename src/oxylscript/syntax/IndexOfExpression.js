module.exports = async (_a, _b, search, _c, full) =>
	(await full.run()).indexOf(await search.run());
