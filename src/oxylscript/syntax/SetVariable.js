module.exports = function(_a, _b, _c, variable, _d, value) {
	this.data.variables[variable.run()] = value.run();
};
