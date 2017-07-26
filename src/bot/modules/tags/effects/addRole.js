module.exports = {
	customOnly: true,
	name: "Add Role to Member",
	description: "Add a role to a member (custom commands only)",
	examples: [`add {_role} to member from event-message reason "needed role"`],
	patterns: [`add [role[s]] %roles% to %members% [(due to|because|[with] reason) %reason%]`,
		`give %members% [role[s]] %roles% [(due to|because|[with] reason) %reason%]`],
	run: async (options, type, type2, reason) => {
		let role, member;
		if(options.matchIndex === 0) {
			role = type;
			member = type2;
		} else {
			role = type2;
			member = type;
		}

		if(!role.addable) {
			throw new options.TagError(`Oxyl's role is in a lower position than ${role.name} so it cannot be added`);
		} else {
			try {
				await member.addRole(role.id, reason);
			} catch(err) {
				throw new options.TagError("Could not add role to member");
			}
		}
	}
};
