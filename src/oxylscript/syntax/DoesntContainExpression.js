module.exports = async (full, _a, _b, search) =>
	!(await full.run()).includes(await search.run());
