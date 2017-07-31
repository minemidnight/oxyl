module.exports = {
	name: "Is Hoisted",
	description: "Check if a role is hoisted",
	examples: [`set {_roles} to roles of member from event-message\n` +
		`if {_roles::1} is hoisted:\n` +
		`\treturn "You have a hoisted role!"\nend`],
	patterns: [`%roles% (is|are) hoisted`],
	run: async (role) => role.hoisted
};
