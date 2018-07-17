module.exports = async (full, _a, search) =>
	!!~(await full.run()).indexOf(await search.run());
