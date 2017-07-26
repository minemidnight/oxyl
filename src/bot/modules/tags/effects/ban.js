module.exports = {
	customOnly: true,
	name: "Ban Member",
	description: "Ban a member from the server, delete message days defaults to 0 (custom commands only)",
	examples: [`ban member from event-message reason "spam"`],
	patterns: [`ban %members% [[with] %integer% delete [message] days] [[and] (due to|because|[with] reason) %reason%]`],
	run: async (options, member, deleteDays = 0, reason) => {
		if(!member.bannable) {
			throw new options.TagError(`Oxyl doesn't have perms to kick the user`);
		} else {
			try {
				await member.ban(deleteDays, reason);
			} catch(err) {
				throw new options.TagError("Could not kick member");
			}
		}
	}
};
