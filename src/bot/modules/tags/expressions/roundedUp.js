module.exports = {
	name: "Rounded Up",
	description: "A number rounded up (ceiling)",
	examples: [`set {_six} to 5.7 rounded up`],
	patterns: [`ceil[ing](%number%)`, `[(a|the)] round[ed] up %number%`],
	returns: "integer",
	run: async (options, number) => Math.ceil(number)
};
