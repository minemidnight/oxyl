module.exports = (value, _a, _b) => {
	value = value.run();

	return value === undefined || value === null;
};
