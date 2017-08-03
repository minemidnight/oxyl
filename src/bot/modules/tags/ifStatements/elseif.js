module.exports = {
	name: "Else if",
	description: "Execute alternate code if something is true and it does not satisfy the first if statement",
	examples: [`if member has perm to ban members:\n\treturn "You have perms to ban them!"\n` +
		`else if member has perm to kick members:\n\treturn "You can only kick :("\nend`],
	patterns: [`el(se )?if (.*?)`],
	run: async (options, { value }) => !!value
};
