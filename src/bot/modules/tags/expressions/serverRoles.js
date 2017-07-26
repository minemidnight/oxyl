module.exports = {
	name: "Roles of a server",
	description: "A list of the roles a server has",
	examples: [`set {_roles} to roles of server from event-message`],
	patterns: [`[the] roles of %servers%`, `%servers%['[s]] roles`],
	returns: "role list",
	run: async (options, server) => options.types.role
};
