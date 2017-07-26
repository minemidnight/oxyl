module.exports = {
	name: "Message",
	description: "A Discord Message",
	examples: [`set {_message} to event-message`],
	run: async (options, message) => ({
		type: "message",
		value: message
	})
};
