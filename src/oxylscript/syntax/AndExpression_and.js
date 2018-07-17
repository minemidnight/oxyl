module.exports = async (expressionOne, _a, expressionTwo) =>
	await expressionOne.run() && await expressionTwo.run();
