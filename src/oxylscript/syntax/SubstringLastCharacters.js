module.exports = (_a, _b, count, _c, string) => {
	string = string.run();

	return string.substring(string.length - count.run());
};
