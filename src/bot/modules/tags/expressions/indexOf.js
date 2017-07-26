module.exports = {
	name: "Index of",
	description: "The first or last index of a character (or text) in a text, or -1 if it doesn't occur in the text. " +
		"Indices range from 1 to the length of the text.",
	examples: [`set {_index} to index of "abc" in "abcdefgh"`],
	patterns: [`[the] [first] index of %text% in %text%`,
		`[the] last index of %text% in %text%`],
	run: async (options, text, search) => {
		if(options.matchIndex === 0) return text.indexOf(search);
		else return text.lastIndexOf(search);
	}
};
