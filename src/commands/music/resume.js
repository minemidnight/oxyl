module.exports = {
	process: async message => {
		let player = bot.players.get(message.channel.guild.id);
		if(!player) {
			return "There is currently no music playing";
		} else if(!player.voiceCheck(message.member)) {
			return "You must be listening to music to use this command";
		} else if(!player.connection.paused) {
			return "The music is not paused";
		} else {
			player.connection.resume();
			return "Music resumed";
		}
	},
	guildOnly: true,
	description: "Resume the music in your channel"
};
