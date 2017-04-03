bot.on("guildMemberAdd", (guild, member) => {
	bot.utils.rolePersistHandler(guild, member, "join");
});

bot.on("guildMemberRemove", (guild, member) => {
	bot.utils.rolePersistHandler(guild, member, "leave");
});
