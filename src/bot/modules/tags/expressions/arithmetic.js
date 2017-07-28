module.exports = {
	name: "Arithmetic",
	description: "Arithmetic expressions: addition (+), subtraction (-), " +
		"multiplication (*), division (/), exponentation (^) and modular (mod)",
	examples: [`set {_result} to 5 * (6 + 4)`, `set {_result} to 2^3`],
	patterns: [`%number%[ ]\\+[ ]%number%`,
		`%number%[ ]\\-[ ]%number%`,
		`%number%[ ]\\*[ ]%number%`,
		`%number%[ ]\\/[ ]%number%`,
		`%number%[ ]\\^[ ]%number%`,
		`%number%[ ]mod[ ]%number%`],
	returns: "number",
	run: async (options, number1, number2) => {
		if(options.matchIndex === 0) return number1 + number2;
		else if(options.matchIndex === 1) return number1 - number2;
		else if(options.matchIndex === 2) return number1 * number2;
		else if(options.matchIndex === 3) return number1 / number2;
		else if(options.matchIndex === 4) return Math.pow(number1, number2);
		else if(options.matchIndex === 5) return number1 % number2;
		else throw new options.TagError("Match index was out of range");
	}
};
