module.exports = {
	name: "Author of Message",
	description: "The user that sent a message",
	examples: [`set {_author} to author of event-message`],
	patterns: [`[the] (author|user)[s] (of|from) %messages%`, `%messages%['[s]] (author|user)[s]`],
	run: async (options, message) => message.author
};
