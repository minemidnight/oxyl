module.exports = {
	process: async message => {
		let player = bot.players.get(message.channel.guild.id);
		if(!player || !player.connection) {
			return __("phrases.noMusic", message);
		} else if(!player.voiceCheck(message.member)) {
			return __("phrases.notListening", message);
		} else {
			let queue = await player.getQueue();
			if(queue.length === 0) return __("phrases.noQueue", message);
			if(message.args[0] > queue.length) return __("commands.music.jump.invalidQueue", message);
			queue = queue.slice(message.args[0] - 1).concat(queue.slice(0, message.args[0] - 1));
			player.connection.stop();

			await player.setQueue(queue);
			return __("commands.music.jump.success", message, { queue: message.args[0] });
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
