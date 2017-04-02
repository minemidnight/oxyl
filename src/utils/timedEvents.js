module.exports = {
	update: async () => {
		let waitingEvents = await r.table("timedEvents").filter(
			r.row("date").le(Date.now())
		).run();

		waitingEvents.forEach(event => module.exports[event.type](event));
	},

	reminder: data => {
		bot.createMessage(data.channel, `You asked me to remind you about this on ` +
				`${bot.utils.formatDate(data.createdAt)}:\n\n${data.message}`);

		r.table("timedEvents").delete(data.id).run();
	}
};
setInterval(module.exports.update, 15000);
