module.exports = {
	process: async message => {
		let player = bot.players.get(message.channel.guild.id);
		if(!player || !player.connection) {
			return __("phrases.noMusic", message);
		} else if(!player.voiceCheck(message.member)) {
			return __("phrases.notListening", message);
		} else {
			const current = await player.getCurrent();
			if(message.args[0] > current.length / 1000) {
				return __("commands.music.seek.error", message, { max: current.length / 1000 });
			}

			await player.connection.seek(message.args[0] * 1000);
			return __("commands.music.seek.success", message, { time: message.args[0] });
		}
	},
	guildOnly: true,
	description: "Seek to a position in current playing song",
	args: [{
		type: "num",
		label: "seconds",
		min: 0
	}]
};
