module.exports = {
	name: "Has Channel Permission",
	description: "Check if a member has a permission in a specific channel",
	examples: [`if member from event-message has permission to send messages in channel from event-message:\n` +
		`\treturn "Hi!"`],
	patterns: [`%member% has [the] %permissions% in %channels%`],
	run: async (options, member, perm, channel) => channel.permissionsOf(member.id).has(perm)
};
