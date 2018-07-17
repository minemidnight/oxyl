module.exports = async (expression, _a) => {
	expression = await expression.run();

	return expression !== null && expression !== undefined;
};
