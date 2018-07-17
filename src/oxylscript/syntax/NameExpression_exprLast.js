module.exports = async (_a, _b, hasName) =>
	(await hasName.run()).name;
