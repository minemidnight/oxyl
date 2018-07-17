module.exports = async function(variableName, _a, expression) {
	this.data.variables[await variableName.run()] = await expression.run();
};
