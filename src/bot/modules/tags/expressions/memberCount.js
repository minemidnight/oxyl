module.exports = {
	name: "Member count of a server",
	description: "The member count of a server",
	examples: [`set {_count} to member count of server from event-message`],
	patterns: [`[the] amount of member[s] in %servers%`,
		`[the] member count[s] of %servers%`,
		`%servers%['[s]] member count`],
	returns: "integer",
	run: async (options, server) => server.memberCount
};
