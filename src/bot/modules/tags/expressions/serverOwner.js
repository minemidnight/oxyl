module.exports = {
	name: "Server owner member",
	description: "The member that owns a server",
	examples: [`set {_owner} to owner of server from event-message`],
	patterns: [`[the] owner[s] of %servers%`, `%servers%['[s]] owner[s]`],
	returns: "user",
	run: async (options, server) => server.members.get(server.ownerID)
};
