module.exports = (_a, min, _b, max, _c) => {
	min = min.run();
	max = max.run();

	return (Math.random() * Math.abs(max - min + 1)) + min;
};
