module.exports = async (_a, _b, min, _c, max, _d) => {
	min = await min.run();
	max = await max.run();

	return (Math.random() * Math.abs(max - min + 1)) + min;
};
