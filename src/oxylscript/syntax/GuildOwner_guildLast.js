module.exports = (_a, guild) => {
	guild = guild.run();

	return guild.members.get(guild.ownerID).user;
};
