const sqlQueries = Oxyl.modScripts.sqlQueries;
module.exports = async (guild, member, type) => {
	try {
		let channel = await sqlQueries.settings.get(guild, "userlog");
		let tag = await sqlQueries.settings.get(guild, type);
		if(!channel || !tag) return;

		if(!guild.channels.has(channel)) return;
		let fakemsg = {
			guild: guild,
			author: member.user,
			member: member,
			channel: guild.channels.get(channel),
			argsPreserved: [""],
			tagOwner: guild.id
		};

		let parsed = await Oxyl.modScripts.tagModule.executeTag(tag, fakemsg);
		await bot.createMessage(channel, parsed);
	} catch(err) {
		return;
	}
};
