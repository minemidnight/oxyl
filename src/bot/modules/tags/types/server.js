module.exports = {
	name: "Server",
	description: "A Discord Server",
	examples: [`set {_server} to server from event-message`],
	run: (options, server) => ({
		type: "server",
		value: server
	})
};
