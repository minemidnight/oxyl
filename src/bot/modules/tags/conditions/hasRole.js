module.exports = {
	name: "Has Role",
	description: "Check if a member has role",
	examples: [`set {_role} to role named "Owner" in server from event-message\n` +
		`\tif member from event-message has {_role}:\n\t\treturn "Hello owner!"`],
	patterns: [`%member% has [the] [role] %roles%`],
	run: async (options, member, role) => !!~member.roles.indexOf(role.id)
};
