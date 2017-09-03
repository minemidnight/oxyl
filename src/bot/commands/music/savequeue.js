module.exports = {
	process: async message => {
		let donator = await r.db("Oxyl").table("donators").get(message.author.id).run();
		if(!donator) return __("commands.music.savequeue.donatorOnly", message);

		let player = bot.players.get(message.channel.guild.id);
		let queue = await player.getQueue();
		if(!player || !player.connection) {
			return __("phrases.noMusic", message);
		} else if(!player.voiceCheck(message.member)) {
			return __("phrases.notListening", message);
		} else if(queue.length === 0) {
			return __("phrases.noQueue", message);
		} else {
			let alreadySaved = await r.table("savedQueues").get([message.args[0], message.author.id]).run();
			if(alreadySaved) {
				await r.table("savedQueues").get([message.args[0], message.author.id])
					.update({ queue }).run();
			} else {
				await r.table("savedQueues").insert({
					id: [message.args[0], message.author.id],
					queue,
					userID: message.author.id
				}).run();
			}

			return __("commands.music.savequeue.success", message, {
				itemCount: queue.length,
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
