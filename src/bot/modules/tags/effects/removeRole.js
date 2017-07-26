module.exports = {
	customOnly: true,
	name: "Remove Role from Member",
	description: "Remove a role from a member (custom commands only)",
	examples: [`remove {_role} from member from event-message reason "abused role"`],
	patterns: [`remove [role[s]] %roles% from %members% [(due to|because|[with] reason) %reason%]`],
	run: async (options, role, member, reason) => {
		if(!role.addable) {
			throw new options.TagError(`Oxyl's role is in a lower position than ${role.name} so it cannot be removed`);
		} else {
			try {
				await member.removeRole(role.id, reason);
			} catch(err) {
				throw new options.TagError("Could not add role to member");
			}
		}
	}
};
