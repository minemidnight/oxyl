module.exports = {
	name: "Channels of a server",
	description: "A list of the channels in a server",
	examples: [`set {_channels} to channels of server from event-message`],
	patterns: [`[the] channels of %servers%`, `%servers%['[s]] channels`],
	run: async (options, server) => server.channels
};
