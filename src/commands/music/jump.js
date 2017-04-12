module.exports = {
	process: async message => {
		let player = bot.players.get(message.channel.guild.id);
		if(!player) {
			return "There is currently no music playing";
		} else if(!player.voiceCheck(message.member)) {
			return "You must be listening to music to use this command";
		} else {
			if(player.queue.length === 0) return "There is nothing queued";
			if(message.args[0] > player.queue.length) return "Invalid queue number";
			player.queue = player.queue.slice(message.args[0] - 1).concat(player.queue.slice(0, message.args[0] - 1));
			player.connection.stopPlaying();

			return `:white_check_mark: Jumped to queue #${message.args[0]}`;
		}
	},
	guildOnly: true,
	description: "Stop music in your channel",
	args: [{
		type: "int",
		label: "queue #",
		min: 1
	}]
};
