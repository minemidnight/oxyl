module.exports = {
	name: "Difference",
	description: "The difference between two values (numbers, dates)",
	examples: [`set {_timeInServer} to diffeence between creation date of {_server} and join date of {_member}`],
	patterns: [`[the] difference (between|of) %number% and %number%`],
	run: async (options, number1, number2) => number1 - number2
};
