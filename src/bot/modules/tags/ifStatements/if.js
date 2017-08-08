module.exports = {
	name: "If",
	description: "Execute code if something is true",
	examples: [`if member has perm to ban members:\n\treturn "You have perms to ban them!"\nend`],
	patterns: [`if (.*?)`],
	run: async (options, value) => !!value
};
