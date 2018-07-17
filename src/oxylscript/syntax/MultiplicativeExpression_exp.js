module.exports = async (left, _a, right) =>
	Math.pow(await left.run(), await right.run());
