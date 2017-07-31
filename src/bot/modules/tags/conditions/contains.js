module.exports = {
	name: "Contains",
	description: "Checks if a text has a text in it, or if a list has a element in it",
	examples: [`if "hello" contains "hi":\n\treturn "That isn't possible!"\nend`],
	patterns: [`%texts% (ha(s|ve)|contain[s]|include[s]) %texts%`,
		`%lists% (ha(s|ve)|contain[s]|include[s]) %anys%`],
	run: async (options, type, type2) => ~type.indexOf(type2)
};
