module.exports = {
	name: "List",
	description: "A list that holds multiple values",
	examples: [`set {_list::*} to 5 and 6`],
	patterns: [`(.*?(, |and)){2,}`],
	patternRegex: true,
	run: (options, items) => ({
		type: "list",
		value: items
	})
};
