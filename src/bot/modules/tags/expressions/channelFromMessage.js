module.exports = {
	name: "Channel from Message",
	description: "The channel that the message was sent in",
	examples: [`set {_channel} to channel from event-message`],
	patterns: [`[the] channel[s] (of|from) %messages%`, `%messages%['[s]] channel[s]`],
	run: async (options, message) => message.channel
};
