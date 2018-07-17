module.exports = async (_a, count, _b, string) => {
	string = await string.run();

	return string.substring(string.length - await count.run());
};
