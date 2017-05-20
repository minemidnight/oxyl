module.exports = {
	update: async () => {
		let waitingEvents = await r.table("timedEvents").filter(
			r.row("date").le(Date.now())
		).run();

		waitingEvents.forEach(event => {
			if(!module.exports[event.type] || !event || !event.type) return;
			else module.exports[event.type](event);
			r.table("timedEvents").get(event.id).delete().run();
		});
	},

	reminder: data => {
		let content = __("modules.timedEvents.reminder", { locale: bot.localeCache.get(data.userID) || "en" }, {
			date: bot.utils.formatDate(data.createdAt),
			action: data.action
		});

		bot.createMessage(data.channelID, content);
	},

	giveaway: async data => {
		let entrees = await bot.getMessageReaction(data.channelID, data.messageID, "🎉")
			.filter(user => !user.bot);

		if(entrees.length === 0) {
			let content = __("modules.timedEvents.noGiveawayEntries",
				{ locale: bot.localeCache.get(data.guildID) || "en" },
				{ item: data.item });

			bot.createMessage(data.channelID, content);
		} else {
			let winner = entrees[Math.floor(Math.random() * entrees.length)];
			let content = __("modules.timedEvents.giveawayWinner",
				{ locale: bot.localeCache.get(data.guildID) || "en" },
				{ winner: winner.mention, item: data.item });

			bot.createMessage(data.channelID, content);
		}
	}
};
setInterval(module.exports.update, 15000);
