module.exports = {
	name: "Server from Message",
	description: "The server that the message was sent in",
	examples: [`set {_server} to server from event-message`],
	patterns: [`[the] server[s] (of|from) %messages%`, `%messages%['[s]] server[s]`],
	returns: "server",
	run: async (options, message) => message.channel.guild
};
