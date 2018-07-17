module.exports = async (member, _a) =>
	(await member.run()).game && member.game.name;
