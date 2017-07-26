module.exports = {
	name: "Channel",
	description: "A Discord Channel",
	examples: [`set {_channel} to channel from event-message`],
	run: async (options, channel) => ({
		type: "channel",
		value: channel
	})
};
