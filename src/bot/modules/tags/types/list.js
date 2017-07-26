module.exports = {
	name: "List",
	description: "A list that holds multiple values",
	examples: [`set {_list::*} to 5 and 6`],
	patterns: [`^(?:%capture%(?:,|and)[ ]){2,}$`],
	patternRegex: true,
	run: async (options, items) => ({
		type: "list",
		value: items
	})
};
