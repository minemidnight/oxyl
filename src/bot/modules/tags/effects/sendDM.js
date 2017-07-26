module.exports = {
	name: "Send DM to User/Member",
	description: "Send a direct message to a member or user",
	examples: [`send "hi" to author of event-message`],
	patterns: [`send [a[n]] [dm][s] [saying] %text% to %users%`,
		`send [a[n]] [dm][s] [saying] %text% to %members%`],
	run: async (options, content, type) => {
		let user = options.matchIndex === 0 ? type : type.user;
		try {
			var channel = await user.getDMChannel();
		} catch(err) {
			throw new options.TagError("Could not open a DM channel with the requested user");
		}

		try {
			await channel.createMessage(content, content.file);
		} catch(err) {
			throw new options.TagError("Could not send a message to the requested user");
		}
	}
};
