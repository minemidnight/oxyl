module.exports = (guild, _a) => {
	guild = guild.run();

	return guild.members.get(guild.ownerID).user;
};
