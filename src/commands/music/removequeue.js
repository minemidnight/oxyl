module.exports = {
	process: async message => {
		let player = bot.players.get(message.channel.guild.id);
		if(!player) {
			return __("phrases.noMusic", message);
		} else if(!player.voiceCheck(message.member)) {
			return __("phrases.notListening", message);
		} else {
			if(player.queue.length === 0) return __("phrases.noQueue", message);

			let toRemove = [];
			if(message.args[0].indexOf("-") !== -1) {
				let match = message.args[0].match(/((?:\d|l(?:atest)?)+)\s?-\s?((?:\d|l(?:atest)?)+)/);
				if(match[1] === "l" || match[1] === "latest") match[1] = player.queue.length;
				else match[1] = parseInt(match[1]);
				if(match[2] === "l" || match[1] === "latest") match[2] = player.queue.length;
				else match[2] = parseInt(match[2]);

				if(match[2] < match[1]) return "Invalid range given!";
				for(let i = match[1]; i <= match[2]; i++) toRemove.push(i);
			} else if(message.args[0].indexOf(",") !== -1) {
				message.args[0].split(",").forEach(toRemove.push);
			} else {
				toRemove.push(message.args[0]);
			}

			toRemove = toRemove.map(int => {
				if(int === "l" || int === "latest") return player.queue.length;
				else return parseInt(int);
			});
			if(toRemove.some(int => isNaN(int))) return __("commands.music.removequeue.invalidQueue", message);

			toRemove.forEach(int => delete player.queue[int]);
			player.queue = player.queue.filter(item => item !== undefined);
			return __("commands.music.removequeue.success", message, { itemCount: toRemove.length });
		}
	},
	guildOnly: true,
	aliases: ["music"],
	description: "Stop music in your channel"
};
