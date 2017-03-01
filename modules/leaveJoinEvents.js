bot.on("guildMemberAdd", (guild, member) => {
	Oxyl.statsd.gauge(`oxyl.users`, bot.users.size);
	Oxyl.modScripts.userLog(guild, member, "userjoin");
	Oxyl.cmdScripts.autorole(guild, member);
});

bot.on("guildMemberRemove", (guild, member) => {
	Oxyl.statsd.gauge(`oxyl.users`, bot.users.size);
	Oxyl.modScripts.userLog(guild, member, "userleave");
});
