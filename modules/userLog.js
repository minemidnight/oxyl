const Oxyl = require("../oxyl.js"),
	framework = require("../framework.js");
const bot = Oxyl.bot,
	parseTag = Oxyl.cmdScripts.tags.parseTag;

async function userLog(guild, member, type) {
	try {
		let channel = await framework.getSetting(guild, "userlog");
		let tag = await framework.getSetting(guild, type);

		if(!guild.channels.has(channel)) return;
		let fakemsg = {
			guild: guild,
			author: member.user || member,
			member: member,
			channel: guild.channels.get(channel),
			argsPreserved: [""]
		};

		let parsed = await parseTag(tag, fakemsg);
		await bot.createMessage(channel, parsed);
	} catch(err) {
		return;
	}
}

bot.on("guildMemberAdd", (guild, member) => {
	userLog(guild, member, "userjoin");
});

bot.on("guildMemberRemove", (guild, member) => {
	userLog(guild, member, "userleave");
});
