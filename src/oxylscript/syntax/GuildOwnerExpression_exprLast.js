module.exports = async (_a, _b, guild) => {
	guild = await guild.run();
	return guild.members.get(guild.ownerID).user;
};
