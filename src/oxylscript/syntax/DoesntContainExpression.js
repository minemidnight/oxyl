module.exports = async (full, _a, _b, search) =>
	!~(await full.run()).indexOf(await search.run());
