module.exports = {
	process: async message => {
		let player = bot.players.get(message.channel.guild.id);
		if(!player || !player.connection) {
			return __("phrases.noMusic", message);
		} else if(!player.voiceCheck(message.member)) {
			return __("phrases.notListening", message);
		} else {
			let queue = await player.getQueue();
			let next = queue[0];
			player.connection.stop();

			if(next) return __("commands.music.skip.successNextSong", message, { title: next.title });
			else return __("commands.music.skip.successNoneLeft", message);
		}
	},
	guildOnly: true,
	description: "Skip a song"
};
