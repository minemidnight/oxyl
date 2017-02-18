module.exports = async (guild, member, type) => {
	try {
		let channel = await framework.getSetting(guild, "userlog");
		let tag = await framework.getSetting(guild, type);

		if(!guild.channels.has(channel)) return;
		let fakemsg = {
			guild: guild,
			author: member.user,
			member: member,
			channel: guild.channels.get(channel),
			argsPreserved: [""]
		};

		let parsed = await Oxyl.modScripts.tagModule.executeTag(tag, fakemsg);
		await bot.createMessage(channel, parsed);
	} catch(err) {
		return;
	}
};
