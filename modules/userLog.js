const Oxyl = require("../oxyl.js"),
	framework = require("../framework.js");
const bot = Oxyl.bot,
	parseTag = Oxyl.cmdScripts.tags.parseTag;

function userLog(guild, member, type) {
	framework.getSetting(guild, "userlog")
	.then(channel => {
		if(!guild.channels.has(channel)) return;
		framework.getSetting(guild, type)
		.then(tag => {
			let fakemsg = {
				guild: guild,
				author: member.user,
				member: member,
				channel: guild.channels.get(channel),
				args: [""],
				argsPreserved: [""],
				tagVars: []
			};

			parseTag(tag, fakemsg).then(parsed => {
				bot.createMessage(channel, parsed).catch();
			}).catch();
		}).catch();
	}).catch();
}

bot.on("guildMemberAdd", (guild, member) => {
	userLog(guild, member, "userjoin");
});

bot.on("guildMemberRemove", (guild, member) => {
	userLog(guild, member, "userleave");
});
