module.exports = async (_a, _b, min, _c, max) => {
	min = await min.run();
	max = await max.run();

	return (Math.random() * Math.abs(max - min)) + min;
};
