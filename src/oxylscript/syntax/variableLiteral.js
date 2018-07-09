module.exports = function(_a, _b, variable) {
	variable = variable.run();
	const value = this.data.variables[variable];

	if(value === undefined) throw new Error(`${variable} has not been defined`);
	return value;
};
