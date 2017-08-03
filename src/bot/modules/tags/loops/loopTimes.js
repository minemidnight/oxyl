module.exports = {
	name: "Loop nth times",
	description: "Loop code a certain amount of times",
	examples: [`set {_var} to 0\nloop 5 times:\n\tadd 1 to {_var}`],
	patterns: [`loop %integer% times`],
	run: async (options, times) => {
		for(let i = times; i--;) {
			options = options.run("next", { "loop-number": i });
		}

		return options;
	}
};
