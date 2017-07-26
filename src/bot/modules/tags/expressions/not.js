module.exports = {
	name: "Not",
	description: "The opposite of a boolean (true/false value)",
	examples: [`set {_false} to not true`],
	patterns: [`[the] (not|opposite)[s] [of] %anys%`],
	run: async (options, type) => !type
};
