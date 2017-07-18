module.exports = {
	process: async message => {
		let player = bot.players.get(message.channel.guild.id);
		if(!player || !player.connection) {
			return __("phrases.noMusic", message);
		} else if(!player.voiceCheck(message.member)) {
			return __("phrases.notListening", message);
		} else {
			if(player.queue.length === 0) return __("phrases.noQueue", message);
			if(message.args[0] > player.queue.length) return __("commands.music.jump.invalidQueue", message);
			player.queue = player.queue.slice(message.args[0] - 1).concat(player.queue.slice(0, message.args[0] - 1));
			player.connection.stopPlaying();

			return __("commands.music.success", message, { queue: message.agrs[0] });
		}
	},
	guildOnly: true,
	description: "Jump to a song in the queue",
	args: [{
		type: "num",
		label: "queue #",
		min: 1
	}]
};
