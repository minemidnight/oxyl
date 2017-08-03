module.exports = {
	name: "Loop list",
	description: "The opposite of a boolean (true/false value)",
	examples: [`set {_false} to not true`],
	patterns: [`loop %list%`],
	run: async (options, list) => {
		list.forEach((value, index) => {
			options = options.run("next", {
				"loop-value": value,
				"loop-index": index + 1
			});
		});

		return options;
	}
};
