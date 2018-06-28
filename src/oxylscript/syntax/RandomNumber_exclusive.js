module.exports = (_a, min, _b, max) => {
	min = min.run();
	max = max.run();

	return (Math.random() * Math.abs(max - min)) + min;
};
