module.exports = {
	name: "Role",
	description: "A Discord Role",
	examples: [`set {_role} to random element out of roles of member from event-message`],
	run: async (options, role) => ({
		type: "role",
		value: role
	})
};
