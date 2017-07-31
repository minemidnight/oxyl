module.exports = {
	name: "Is not number",
	description: "Check if something is not a number",
	examples: [`if {_test} is not a number:\n\tset {_test} to 5\nend`],
	patterns: [`%anys% (isn[']t|is not|aren[']t|are not) numbers`],
	run: async (options, type) => isNaN(type) || typeof type !== "number"
};
