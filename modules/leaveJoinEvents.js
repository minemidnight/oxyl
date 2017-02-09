bot.on("guildMemberAdd", (guild, member) => {
	Oxyl.modScripts.userLog(guild, member, "userjoin");
	Oxyl.cmdScripts.autorole(guild, member);
});

bot.on("guildMemberRemove", (guild, member) => {
	Oxyl.modScripts.userLog(guild, member, "userleave");
});
