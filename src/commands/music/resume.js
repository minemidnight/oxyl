module.exports = {
	process: async message => {
		let player = bot.players.get(message.channel.guild.id);
		if(!player) {
			return __("phrases.noMusic", message);
		} else if(!player.voiceCheck(message.member)) {
			return __("phrases.notListening", message);
		} else if(!player.connection.paused) {
			return __("commands.music.resume.notPaused", message);
		} else {
			player.connection.resume();
			return __("commands.music.resume.success", message);
		}
	},
	guildOnly: true,
	description: "Resume the music in your channel"
};
