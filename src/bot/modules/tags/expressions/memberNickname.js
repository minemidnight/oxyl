module.exports = {
	name: "Nickname of member",
	description: "The nickname of a member. If the member has no nickname, their username",
	examples: [`set {_nick} to nickname of member from event-message`],
	patterns: [`[the] nick[name][s] (of|from) %members%`, `%members%['[s]] nick[name][s]`],
	returns: "string",
	run: async (options, member) => member.nick || member.user.username
};
