module.exports = {
	async run({ author, args: [title, description], channel, client, guild, r, t }) {
		const { enabled, channelID } = await r.table("suggestions")
			.get(guild.id)
			.default({ enabled: false })
			.run();

		if(!enabled) return t("commands.suggestions.notEnabled");
		if(!title) {
			channel.createMessage(t("commands.suggestions.prompt.title"));
			[title] = await channel.awaitMessages(msg => msg.author.id === author.id, { time: 45000, maxMatches: 1 });
			if(!title) return t("commands.suggestions.prompt.timedOut");
			else if(title.content.toLowerCase() === "cancel") return t("command.suggestions.prompt.cancelled");
			else title = title.content;
		}

		if(!description) {
			channel.createMessage(t("commands.suggestions.prompt.description"));
			[description] = await channel.awaitMessages(msg => msg.author.id === author.id, { time: 45000, maxMatches: 1 });
			if(!description) return t("commands.suggestions.prompt.timedOut");
			else if(description.content.toLowerCase() === "cancel") return t("command.suggestions.prompt.cancelled");
			else description = description.content;
		}

		try {
			const message = await client.createMessage(channelID, {
				embed: {
					title,
					description,
					timestamp: new Date(),
					footer: {
						text: `From ${author.username}#${author.discriminator}`,
						icon_url: author.avatarURL // eslint-disable-line camelcase
					}
				}
			});

			await message.addReaction("👍");
			await message.addReaction("👎");
		} catch(err) {} // eslint-disable-line no-empty

		return t("commands.suggestions");
	},
	args: [{
		type: "text",
		label: "title",
		optional: true
	}, {
		type: "text",
		label: "description",
		optional: true
	}]
};
