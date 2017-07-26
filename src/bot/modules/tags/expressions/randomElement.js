module.exports = {
	name: "Random Element",
	description: "Random item out of a list",
	examples: [`set {_role} to random element of roles of member from event-message`],
	patterns: [`[a] random (item|element)[s] [out] of %lists%`],
	run: async (options, type, list) => list[Math.floor(Math.random() * list.length)]
};
