module.exports = {
	name: "Split",
	description: "Splits serveral texts at a common delimiter (e.g. ',')",
	examples: [`set {_args} to content of event-message split at " "`],
	patterns: [`split %text% (at|using|by) [[the] delimiter] %text%`,
		`%text% [split] (at|using|by) [[the] delimiter] %text%`],
	returns: "list",
	run: async (options, text, splitter) => text.split(splitter)
};
