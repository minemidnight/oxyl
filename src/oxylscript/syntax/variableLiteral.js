module.exports = async function(_a, variableName) {
	variableName = await variableName.run();
	const value = this.data.variables[variableName];

	if(value === undefined) throw new Error(`${variableName} has not been defined`);
	return value;
};
