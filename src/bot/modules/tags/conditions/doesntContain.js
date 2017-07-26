module.exports = {
	name: "Doesn't contain",
	description: "Checks if a text doesn't have a text in it, or if a list doesn't have a element in it",
	examples: [`if "hello" doesn't contain "ello":\n\treturn "That isn't possible!"`],
	patterns: [`%texts% do[es](n't| not) (ha(s|ve)|contain[s]|include[s]) %texts%`,
		`%lists% do[es](n't| not) (ha(s|ve)|contain[s]|include[s]) %anys%`],
	run: async (options, type, type2) => ~type.indexOf(type2)
};
