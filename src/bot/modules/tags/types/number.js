module.exports = {
	name: "Integer",
	description: "A number, with a floating-point (decimal) value",
	examples: [`set {_number} to 5.5`],
	patterns: [`\\d.\\d`],
	patternRegex: true,
	run: async (options, num) => ({
		type: "number",
		value: parseFloat(num)
	})
};
