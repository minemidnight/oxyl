module.exports = async (discordType, _a) =>
	(await discordType.run()).createdAt;
