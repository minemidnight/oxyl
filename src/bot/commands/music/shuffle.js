function shuffle(array) {
	for(let i = array.length; i; i--) {
		let index = Math.floor(Math.random() * i);
		[array[i - 1], array[index]] = [array[index], array[i - 1]];
	}
}

module.exports = {
	process: async message => {
		let player = bot.players.get(message.channel.guild.id);
		if(!player || !player.connection) {
			return __("phrases.noMusic", message);
		} else if(!player.voiceCheck(message.member)) {
			return __("phrases.notListening", message);
		} else {
			let queue = await player.getQueue();
			shuffle(queue);
			await player.setQueue(queue);

			return __("commands.music.shuffle.success", message);
		}
	},
	guildOnly: true,
	description: "Shuffle the queue"
};
