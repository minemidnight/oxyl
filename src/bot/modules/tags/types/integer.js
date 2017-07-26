module.exports = {
	name: "Integer",
	description: "A full, negative or positive number",
	examples: [`set {_int} to 5`],
	patterns: [`(^\d+)$`],
	patternRegex: true,
	run: async (options, int) => ({
		type: "integer",
		value: parseInt(int)
	})
};
