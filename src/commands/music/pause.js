module.exports = {
	process: async message => {
		let player = bot.players.get(message.channel.guild.id);
		if(!player) {
			return __("phrases.noMusic", message);
		} else if(!player.voiceCheck(message.member)) {
			return __("phrases.notListening", message);
		} else if(player.connection.paused) {
			return __("commands.music.pause.alreadyPaused", message);
		} else {
			player.connection.pause();
			return __("commands.music.pause.success", message);
		}
	},
	guildOnly: true,
	description: "Pause music in your channel"
};
