module.exports = {
	process: async message => {
		let player = bot.players.get(message.channel.guild.id);
		if(!player || !player.connection) return __("phrases.noMusic", message);

		let queueMsg = "";
		let page = message.args[0] || 1;
		let pageAmount = Math.ceil(player.queue.length / 15);
		if(page > pageAmount) page = pageAmount;

		if(player.queue.length > 0) {
			queueMsg += player.queue.slice((page - 1) * 15, ((page - 1) * 15) + 15)
				.map((song, i) => `[${((page - 1) * 15) + i + 1}] ${song.title}`)
				.join("\n");

			queueMsg += `\n**${__("words.page", message, {}, true)} ${page}/${pageAmount}**`;
		} else {
			queueMsg += `N/A`;
		}

		if(!player.current || !player.connection) {
			queueMsg += "\n\n";
			queueMsg += __("phrases.queueError", message);
		} else {
			if(!isNaN(player.current.duration)) var videoDuration = bot.utils.secondsToDuration(player.current.duration);
			let playTime = bot.utils.secondsToDuration(Math.floor(player.connection.current.playTime / 1000));

			queueMsg += "\n\n";
			queueMsg += __("phrases.currentPlaying", message, {
				title: player.current.title,
				duration: videoDuration ? `${playTime}/${videoDuration}` : `${playTime}/LIVE`
			});
		}

		queueMsg += "\n";
		queueMsg += __("phrases.repeat", message, { repeat: __(`words.${player.repeat ? "on" : "off"}`, message) });
		return __("commands.music.queue.success", message, {
			itemCount: player.queue.length,
			message: queueMsg
		});
	},
	guildOnly: true,
	description: "List the music queue",
	args: [{
		type: "num",
		label: "page",
		optional: true,
		min: 1
	}]
};
