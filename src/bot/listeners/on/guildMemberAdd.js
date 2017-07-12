module.exports = (guild, member) => {
	bot.utils.autoRole(guild, member);
	bot.utils.rolePersistHandler(guild, member, "join");
	bot.utils.userLog(guild, member, "join");
};
