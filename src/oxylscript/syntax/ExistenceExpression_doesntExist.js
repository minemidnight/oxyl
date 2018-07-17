module.exports = async (expression, _a, _b) => {
	expression = await expression.run();

	return expression === null || expression === undefined;
};
