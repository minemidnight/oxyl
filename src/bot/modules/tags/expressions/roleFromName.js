module.exports = {
	name: "Role from Name",
	description: "A role based off the name of it (case-sensitive)",
	examples: [`set {_role} to role named "Owner" in server from event-message`],
	patterns: [`[the] role[s] name[d] %texts% (in|from) %server%`],
	run: async (options, name, server) => server.roles.find(role => role.name === name)
};
