module.exports = {
	name: "Channel",
	description: "A Discord Channel",
	examples: [`set {_channel} to channel from event-message`],
	run: (options, channel) => ({
		type: "channel",
		value: channel
	})
};
