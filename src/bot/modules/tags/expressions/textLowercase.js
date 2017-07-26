module.exports = {
	name: "Text to Lowercase",
	description: "Text converted to lowercase characters",
	examples: [`set {_lower} to "HELLO" converted to lowercase`],
	patterns: [`%texts% [converted] to lowercase[s]`, `lowercase[s] of %texts%`],
	run: async (options, text) => text.toLowerCase()
};
