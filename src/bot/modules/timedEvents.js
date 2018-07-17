module.exports = {
	async update(wiggle) {
		const r = wiggle.locals.r;
		const waitingEvents = await r.table("timedEvents").between(r.minval, Date.now(), { index: "date" }).run();

		waitingEvents.forEach(event => {
			if(!module.exports[event.type] || !event || !event.type) return;
			else module.exports[event.type](event, wiggle);
			process.logger.debug("timed events", `Running timed event for ${event.type}`);
			r.table("timedEvents").get(event.uuid).delete().run();
		});
	},
	async tempban({ userID, guildID }, wiggle) {
		wiggle.erisClient.unbanGuildMember(guildID, userID, "Tempban")
			.catch(err => {}); // eslint-disable-line no-empty-function, handle-callback-err
	},
	async temprole({ userID, guildID, roleID }, wiggle) {
		wiggle.erisClient.removeGuildMemberRole(guildID, userID, roleID, "Temprole")
			.catch(err => { }); // eslint-disable-line no-empty-function, handle-callback-err
	}
};
