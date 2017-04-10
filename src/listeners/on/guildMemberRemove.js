module.exports = (guild, member) => {
	bot.utils.rolePersistHandler(guild, member, "leave");
	bot.utils.userLog(guild, member, "leave");
};
