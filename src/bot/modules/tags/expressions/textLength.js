module.exports = {
	name: "Length of Text",
	description: "Length of a text (number of characters)",
	examples: [`set {_length} to length of "hello"`],
	patterns: [`[the] length of %text%`, `%text%'[s] length`, `[number of] char[acter]s in %text%`],
	returns: "integer",
	run: async (options, text) => text.length
};
