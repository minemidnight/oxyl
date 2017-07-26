module.exports = {
	name: "Text to Uppercase",
	description: "Text converted to uppercase charcters",
	examples: [`set {_upper} to "hello" converted to uppercase`],
	patterns: [`%texts% [converted] to uppercase[s]`, `uppercase[s] of %texts%`],
	returns: "text",
	run: async (options, text) => text.toUpperCase()
};
