module.exports = {
	name: "Server",
	description: "A Discord Server",
	examples: [`set {_server} to server from event-message`],
	run: async (options, channel) => ({
		type: "server",
		value: channel
	})
};
