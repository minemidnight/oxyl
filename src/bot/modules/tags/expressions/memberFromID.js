module.exports = {
	name: "Member from ID",
	description: "A member based off their ID",
	examples: [`set {_member} to member from id "138802943653576705" in server from event-message`],
	patterns: [`[the] member[s] (with|from) id[s] %texts% (in|from) %server%`],
	run: async (options, id, server) => server.members.get(id)
};
