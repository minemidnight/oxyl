module.exports = {
	name: "Has Role",
	description: "Check if a member has role",
	examples: [`set {_role} to role named "Owner" in server from event-message\n` +
		`if member from event-message has {_role}:\n\treturn "Hello owner!"\nend`],
	patterns: [`%member% has [the] [role] %roles%`],
	run: async (options, member, role) => !!~member.roles.indexOf(role.id)
};
