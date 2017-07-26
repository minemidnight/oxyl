module.exports = {
	name: "Roles of member",
	description: "A list of the roles a member has",
	examples: [`set {_roles} to roles of member from event-message`],
	patterns: [`[the] role[s] of %members%`, `%members%['[s]] role[s]`],
	returns: "role list",
	run: async (options, member) => member.roleObjects
};
