module.exports = {
	name: "Type of",
	description: "Get the type of something",
	examples: [`type of {_value}`],
	patterns: [`%anys%['][s] type[of]`, `type[ ]of %anys%`],
	returns: "text",
	giveRaw: true,
	run: async (options, value) => value.type
};
