module.exports = {
	name: "Message content",
	description: "The content of a message",
	examples: [`set {_content} to content of event-message`],
	patterns: [`[the] content[s] [of] %messages%`, `%messages%['[s]] content[s]`],
	returns: "text",
	run: async (options, message) => message.content
};
