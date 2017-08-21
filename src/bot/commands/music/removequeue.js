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

			let toRemove = [];
			if(message.args[0].indexOf("-") !== -1) {
				let match = message.args[0].match(/((?:\d|l(?:atest)?)+)\s?-\s?((?:\d|l(?:atest)?)+)/);
				if(match[1] === "l" || match[1] === "latest") match[1] = queue.length;
				else match[1] = parseInt(match[1]);
				if(match[2] === "l" || match[1] === "latest") match[2] = queue.length;
				else match[2] = parseInt(match[2]);

				if(match[2] < match[1]) return "Invalid range given!";
				for(let i = match[1]; i <= match[2]; i++) toRemove.push(i);
			} else if(message.args[0].indexOf(",") !== -1) {
				message.args[0].split(",").forEach(part => toRemove.push(part));
			} else {
				toRemove.push(message.args[0]);
			}

			toRemove = toRemove.map(int => {
				if(int === "l" || int === "latest") return queue.length;
				else return parseInt(int);
			});
			if(toRemove.some(int => isNaN(int))) return __("commands.music.removequeue.invalidQueue", message);

			toRemove.forEach(int => delete queue[int]);
			queue = queue.filter(item => item !== undefined);

			player.setQueue(queue);
			return __("commands.music.removequeue.success", message, { itemCount: toRemove.length });
		}
	},
	guildOnly: true,
	aliases: ["music"],
	description: "Stop music in your channel"
};
