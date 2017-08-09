module.exports = {
	name: "Number",
	description: "A number, with a floating-point (decimal) value",
	examples: [`set {_number} to 5.5`],
	patterns: [`(\\d.\\d)`],
	run: (options, num) => ({
		type: "number",
		value: parseFloat(num)
	})
};
