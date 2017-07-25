module.exports = {
	process: async message => {
		let donator = await r.db("Oxyl").table("donators").get(message.author.id).run();
		if(!donator) return __("commands.music.savequeue.donatorOnly", message);

		let player = bot.players.get(message.channel.guild.id);
		if(!player || !player.connection) {
			return __("phrases.noMusic", message);
		} else if(!player.voiceCheck(message.member)) {
			return __("phrases.notListening", message);
		} else if(player.queue.length === 0) {
			return __("phrases.noQueue", message);
		} else {
			let trimmedQueue = player.queue.map(song => {
				if(song.service === "twitch") return `https://twitch.tv/${song.id}`;
				else if(song.service === "soundcloud") return song.url;
				else if(song.service === "youtube") return `https://www.youtube.com/watch?v=${song.id}`;
				else return false;
			});

			let alreadySaved = await r.table("savedQueues").get([message.args[0], message.author.id]).run();
			if(alreadySaved) {
				await r.table("savedQueues").get([message.args[0], message.author.id])
					.update({ queue: trimmedQueue }).run();
			} else {
				await r.table("savedQueues").insert({
					queue: trimmedQueue,
					savedID: message.args[0],
					userID: message.author.id
				}).run();
			}

			return __("commands.music.savequeue.success", message, {
				itemCount: player.queue.length,
				queueNumber: message.args[0]
			});
		}
	},
	guildOnly: true,
	description: "Save your queue (donators only)",
	args: [{
		type: "num",
		label: "save #",
		min: 1,
		max: 3
	}]
};
