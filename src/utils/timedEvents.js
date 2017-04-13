module.exports = {
	update: async () => {
		let waitingEvents = await r.table("timedEvents").filter(
			r.row("date").le(Date.now())
		).run();

		waitingEvents.forEach(event => {
			if(!module.exports[event.type]) console.error(`${event.type} not in exports`);
			else module.exports[event.type](event);
			r.table("timedEvents").get(event.id).delete().run();
		});
	},

	reminder: data => {
		bot.createMessage(data.channelID, `You asked me to remind you about this on ` +
				`${bot.utils.formatDate(data.createdAt)}:\n\n${data.action}`);
	},

	giveaway: async data => {
		let entrees = await bot.getMessageReaction(data.channelID, data.messageID, "🎉")
			.filter(user => !user.bot);

		if(entrees.length === 0) {
			bot.createMessage(data.channelID, `__**GIVEAWAY WINNER**__\n` +
					`Sadly, nobody entered the giveaway for ${data.item}, so there is no winner.`);
		} else {
			let winner = entrees[Math.floor(Math.random() * entrees.length)];
			bot.createMessage(data.channelID, `__**GIVEAWAY WINNER**__\n` +
					`Congratulations, ${winner.mention} you have won ${data.item}!`);
		}
	}
};
setInterval(module.exports.update, 15000);
