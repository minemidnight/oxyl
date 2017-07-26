module.exports = {
	customOnly: true,
	name: "Kick Member",
	description: "Kick a member from the server (custom commands only)",
	examples: [`kick member from event-message reason "spam"`],
	patterns: [`kick %members% [(due to|because|[with] reason) %reason%]`],
	run: async (options, member, reason) => {
		if(!member.kickable) {
			throw new options.TagError(`Oxyl doesn't have perms to kick the user`);
		} else {
			try {
				await member.kick(reason);
			} catch(err) {
				throw new options.TagError("Could not kick member");
			}
		}
	}
};
