module.exports = {
	name: "Join date of member",
	description: "The date a member joined the server",
	examples: [`return "You joined this server on %formatted date of event-message's member join date%"`],
	patterns: [`[the] join (date|time[stamp])[s] of %members%`, `%members%['[s]] join (date|time[stamp])[s]`],
	returns: "integer",
	run: async (options, member) => member.joinedAt
};
