module.exports = {
	name: "Boolean",
	description: "A boolean",
	examples: [`set {_text} to true`],
	patterns: [`(true)`, `(false)`],
	run: (options, value) => ({ type: "boolean", value: value.toString() === "true" })
};
