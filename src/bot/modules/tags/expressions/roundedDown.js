module.exports = {
	name: "Rounded Down",
	description: "A number rounded down (floor)",
	examples: [`set {_five} to 5.7 rounded down`],
	patterns: [`floor(%number%)`, `[(a|the)] round[ed] down %number%`],
	returns: "integer",
	run: async (options, number) => Math.floor(number)
};
