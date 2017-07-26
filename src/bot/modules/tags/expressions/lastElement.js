module.exports = {
	name: "Last Element",
	description: "Last item of a list",
	examples: [`set {_role} to random element of roles of member from event-message`],
	patterns: [`[the] last (item|element)[s] [out] of %lists%`],
	run: async (options, type, list) => list[list.length]
};
