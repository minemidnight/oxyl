module.exports = async function (_a, _b, variableName, _c, expression) {
	this.data.variables[await variableName.run()] = await expression.run();
};
