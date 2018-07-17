module.exports = async (guild, _a) => {
	guild = await guild.run();
	return guild.members.get(guild.ownerID).user;
};
