module.exports = async (full, _a, search) =>
	!!(await full.run()).includes(await search.run());
