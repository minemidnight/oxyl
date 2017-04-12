module.exports = {
	process: async message => {
		let player = bot.players.get(message.channel.guild.id);
		if(!player) {
			return "There is currently no music playing";
		} else if(!player.voiceCheck(message.member)) {
			return "You must be listening to music to use this command";
		} else {
			let next = player.queue[0];
			player.connection.stopPlaying();
			if(!next) player.connection.disconnect();

			return next ? `Now playing __${next.title}__` : "Song skipped, no more songs in queue";
		}
	},
	guildOnly: true,
	description: "Skip a song"
};
