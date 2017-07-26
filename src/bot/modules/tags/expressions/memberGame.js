module.exports = {
	name: "Game of member",
	description: "The game a member is playing. If the member has no game, it won't be set",
	examples: [`set {_game} to game of member from event-message`],
	patterns: [`[the] game[s] of %members%`, `%members%['[s]] game`],
	run: async (options, member) => member.game ? member.game.name : undefined
};
