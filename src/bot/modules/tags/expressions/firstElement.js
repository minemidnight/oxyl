module.exports = {
	name: "First Element",
	description: "First item of a list",
	examples: [`set {_role} to first element of roles of member from event-message`],
	patterns: [`[the] (1st|first) (item|element)[s] [out] of %lists%`],
	returns: "any",
	run: async (options, type, list) => list[0]
};
