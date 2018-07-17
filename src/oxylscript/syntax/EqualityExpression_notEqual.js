module.exports = async (left, _a, right) =>
	await left.run() !== await right.run();
