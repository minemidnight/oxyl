module.exports = {
	customOnly: true,
	name: "Set Member Nickname",
	description: "Set a member's nickname (custom commands only)",
	examples: [`set nickname of member from event-message to "Cool Dude" with reason "is cool"`],
	patterns: [`set nick[name][s] of %members% to %text% [(due to|because|[with] reason) %reason%]`],
	run: async (options, member, nick, reason) => {
		try {
			await member.edit({ nick }, reason);
		} catch(err) {
			throw new options.TagError("Could not change member nickname");
		}
	}
};
