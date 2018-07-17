module.exports = async (_a, _b, member) =>
	(await member.run()).game && member.game.name;
