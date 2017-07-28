module.exports = {
	name: "Text",
	description: "A string",
	examples: [`set {_text} to "Hello World!"`],
	patterns: [`"([^"]|"")*"`],
	run: async (options, text) => ({
		type: "text",
		value: text
	})
};
