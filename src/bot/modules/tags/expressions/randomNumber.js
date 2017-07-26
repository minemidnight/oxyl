module.exports = {
	name: "Random number",
	description: "A random number between two numbers. Use integer if you do not want a decimal",
	examples: [`set {_number} to random number between 1 and 1.5`],
	patterns: [`[a] random integer (from|between) %number% (to|and) %number%`,
		`[a] random number (from|between) %number% (to|and) %number%`],
	returns: ["integer", "number"],
	run: async (options, type, min, max) => {
		if(options.matchIndex === 0) {
			return Math.floor(Math.random() * (Math.ceil(max) - Math.floor(min) + 1)) + Math.ceil(min);
		} else {
			return (Math.random() * (max - min)) + min;
		}
	}
};
