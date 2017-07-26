module.exports = {
	name: "Default channel of a server",
	description: "The default channel of a server",
	examples: [`set {_channel} to default channel of server from event-message`],
	patterns: [`[the] default channel of %servers%`, `%servers%['[s]] default channel`],
	run: async (options, server) => server.defaultChannel
};
