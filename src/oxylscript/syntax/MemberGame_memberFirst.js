module.exports = (member, _a) => {
	member = member.run();

	return member.game && member.game.name;
};
