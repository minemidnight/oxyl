module.exports = (_a, member) => {
	member = member.run();

	return member.game && member.game.name;
};
