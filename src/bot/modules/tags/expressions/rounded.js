module.exports = {
	name: "Rounded",
	description: "A number rounded up (ceiling) or down (floor) respectively",
	examples: [`set {_six} to 5.7 rounded`],
	patterns: [`round(%number%)`, `[(a|the)] round[ed] %number%`],
	returns: "integer",
	run: async (options, number) => Math.round(number)
};
