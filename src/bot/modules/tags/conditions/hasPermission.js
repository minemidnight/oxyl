module.exports = {
	name: "Has Permisison",
	description: "Check if a member has a permission",
	examples: [`if member from event-message has permission to ban members:\n\tban arg-1 parsed as member`],
	patterns: [`%member% has [the] %permissions%`],
	run: async (options, member, perm) => member.permission.has(perm)
};
