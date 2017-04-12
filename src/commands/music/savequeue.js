module.exports = {
	process: async message => {
		let donator = (await r.table("donators").filter({ id: message.author.id }).run())[0];
		if(!donator) return "You must be a donator to use this command!";

		let player = bot.players.get(message.channel.guild.id);
		if(!player) {
			return "There is currently no music playing";
		} else if(!player.voiceCheck(message.member)) {
			return "You must be listening to music to use this command";
		} else if(player.queue.length === 0) {
			return "There is nothing queued!";
		} else {
			let trimmedQueue = player.queue.map(song => {
				if(song.service === "twitch") return `https://twitch.tv/${song.id}`;
				else if(song.service === "soundcloud") return song.url;
				else if(song.service === "youtube") return `https://www.youtube.com/watch?v=${song.id}`;
				else return false;
			});

			let alreadySaved = (await r.table("savedQueues").filter({
				savedID: message.args[0],
				userID: message.author.id
			}).run())[0];

			if(alreadySaved) {
				await r.table("savedQueues").update({ queue: trimmedQueue }).run();
			} else {
				await r.table("savedQueues").insert({
					queue: trimmedQueue,
					savedID: message.args[0],
					userID: message.author.id
				}).run();
			}

			return `Saved ${player.queue.length} items under saved queue #${message.args[0]}!\n` +
				`Use \`play sq:${message.args[0]}\` to load the queue at a later time`;
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
