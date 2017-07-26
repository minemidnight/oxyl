module.exports = {
	name: "Role from Name",
	description: "A role based off its ID",
	examples: [`set {_role} to role with id "138802943653576705" in server from event-message`],
	patterns: [`[the] role[s] with id[s] %texts% (in|from) %server%`],
	run: async (options, id, server) => server.roles.get(id)
};
