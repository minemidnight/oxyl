module.exports = {
	name: "Server region",
	description: "The region of a server",
	examples: [`set {_region} to region of server from event-message`],
	patterns: [`[the] region[s] of %servers%`, `%servers%['[s]] region[s]`],
	returns: "text",
	run: async (options, server) => server.region
};
