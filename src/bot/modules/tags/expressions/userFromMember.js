module.exports = {
	name: "User from a member",
	description: "The user that belongs to a member",
	examples: [`set {_user} to user from member from event-message`],
	patterns: [`[the] user[s] (of|from) %members%`, `%member%['[s]] user[s]`],
	run: async (options, member) => member.user
};
