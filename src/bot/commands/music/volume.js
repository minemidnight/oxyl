module.exports = {
	process: async message => {
		let donator = await r.db("Oxyl").table("donators").get(message.channel.guild.ownerID).run();
		if(!donator) return __("commands.music.volume.donatorOnly", message);

		let player = bot.players.get(message.channel.guild.id);
		let current = await player.getCurrent();
		if(!player || !player.connection) {
			return __("phrases.noMusic", message);
		} else if(!player.voiceCheck(message.member)) {
			return __("phrases.notListening", message);
		} else if(!current) {
			return __("commands.music.volume.noMusicPlaying", message);
		} else {
			let options = await player.getOptions();
			options.volume = message.args[0];
			player.connection.setVolume(options.volume);

			await player.setOptions(options);
			return __("commands.music.volume.success", message, { volume: options.volume });
		}
	},
	guildOnly: true,
	description: "Changes the volume of the music",
	args: [{
		type: "num",
		label: "volume",
		min: 0,
		max: 100
	}]
};
