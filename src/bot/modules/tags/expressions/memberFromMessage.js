module.exports = {
	name: "Member from Message",
	description: "The member that sent a message",
	examples: [`set {_member} to member from event-message`],
	patterns: [`[the] member[s] (of|from) %messages%`, `%messages%['[s]] member`],
	run: async (options, message) => message.member
};
