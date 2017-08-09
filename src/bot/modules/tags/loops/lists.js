module.exports = {
	name: "Loop list",
	description: "Loop through values of a list",
	examples: [`set {_false} to not true`],
	patterns: [`loop %list%`],
	run: async (options, list) => list
};
