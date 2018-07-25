module.exports = async function(_a, _b, variableName) {
	variableName = await variableName.run();
	const value = this.data.eventVariables[variableName];

	if(value === undefined) throw new Error(`Event variable ${variableName} has not been defined for this event`);
	return value;
};
