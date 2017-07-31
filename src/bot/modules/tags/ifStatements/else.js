module.exports = {
	name: "Else",
	description: "Execute code if all other if statements fail",
	examples: [`if member has perm to ban members:\n\treturn "You have perms to ban them!"\n` +
		`else\n\treturn "You can't ban them!"\nend`],
	patterns: [`else`],
	run: async (options) => options.run("next")
};
