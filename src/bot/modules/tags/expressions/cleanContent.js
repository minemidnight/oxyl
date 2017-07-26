module.exports = {
	name: "Clean message content",
	description: "The clean content of a message (mentions converted)",
	examples: [`set {_content} to clean content of event-message`],
	patterns: [`[the] clean content[s] [of] %messages%`, `%messages%['[s]] clean content[s]`],
	run: async (options, message) => message.content
};
