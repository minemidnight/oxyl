module.exports = {
	name: "User",
	description: "A Discord User",
	examples: [`set {_user} to user from event-message`],
	run: (options, user) => ({
		type: "user",
		value: user
	})
};
