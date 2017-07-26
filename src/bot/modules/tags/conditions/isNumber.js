module.exports = {
	name: "Is number",
	description: "Check if something is a number",
	examples: [`if {_test} is a number:\n\tset {_test} to "text"`],
	patterns: [`%anys% (is|are) numbers`],
	run: async (options, type) => !isNaN(type) && typeof type === "number"
};
