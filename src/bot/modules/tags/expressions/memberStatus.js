module.exports = {
	name: "Status of member",
	description: "The status of a member. Returned as a text",
	examples: [`set {_status} to status of member from event-message`],
	patterns: [`[the] status['] of %members%`, `%members%['[s]] status[']`],
	run: async (options, member) => member.status
};
