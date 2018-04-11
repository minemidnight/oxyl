const Player = require("../../modules/Player");

module.exports = {
	run: async ({ args: [page = 1], guild, message: { member }, t }) => {
		const player = Player.getPlayer(guild.id);

		if(!player || (!player.currentSong && !player.queue.length)) return t("commands.music.notPlaying");
		else if(page > Math.ceil(player.queue.length / 15)) page = Math.ceil(player.queue.length / 15);

		let queueMessage = t("commands.queue.inQueue", { count: player.queue.length });
		queueMessage += "\n";
		if(player.queue.length) {
			queueMessage += player.queue.slice((page - 1) * 15, ((page - 1) * 15) + 15)
				.map((song, i) => `[${((page - 1) * 15) + i + 1}] ${song.title}`)
				.join("\n");

			queueMessage += "\n";
			queueMessage += t("commands.queue.page", { page, totalPages: Math.ceil(player.queue.length / 15) });
		} else {
			queueMessage += "N/A";
		}

		queueMessage += "\n\n";
		queueMessage += t("commands.queue.currentSong", {
			title: player.currentSong.title,
			playTime: Player.formatDuration(player.connection.state.position / 1000),
			duration: player.currentSong.isStream ? "LIVE" : Player.formatDuration(player.currentSong.length / 1000)
		});

		return queueMessage;
	},
	guildOnly: true,
	args: [{
		type: "int",
		label: "page",
		min: 1,
		optional: true
	}]
};
