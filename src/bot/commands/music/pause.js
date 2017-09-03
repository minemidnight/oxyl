module.exports = {
	process: async message => {
		let player = bot.players.get(message.channel.guild.id);
		if(!player || !player.connection) {
			return __("phrases.noMusic", message);
		} else if(!player.voiceCheck(message.member)) {
			return __("phrases.notListening", message);
		} else {
			let options = await player.getOptions();
			if(options.paused) {
				return __("commands.music.pause.alreadyPaused", message);
			} else {
				options.paused = true;
				await player.setOptions(options);
			}

			player.connection.setPause(options.paused);
			return __("commands.music.pause.success", message);
		}
	},
	guildOnly: true,
	description: "Pause music in your channel"
};
