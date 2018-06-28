module.exports = (value, _a) => {
	value = value.run();

	return value !== undefined && value !== null;
};
