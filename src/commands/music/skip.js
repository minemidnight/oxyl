module.exports = {
	process: async message => {
		let player = bot.players.get(message.channel.guild.id);
		if(!player) {
			return __("phrases.noMusic", message);
		} else if(!player.voiceCheck(message.member)) {
			return __("phrases.notListening", message);
		} else {
			let next = player.queue[0];
			player.connection.stopPlaying();
			if(!next) player.connection.disconnect();

			if(next) {
				return __("commands.music.skip.successNextSong", message, { title: next.title });
			} else {
				return __("commands.music.skip.successNoneLeft", message);
			}
		}
	},
	guildOnly: true,
	description: "Skip a song"
};
