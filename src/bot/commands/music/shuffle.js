const Player = require("../../modules/Player");

module.exports = {
	run: async ({ guild, message: { member }, t }) => {
		const player = Player.getPlayer(guild.id);

		if(!player || !player.currentSong) return t("commands.music.notPlaying");
		else if(!player.isListening(member)) return t("commands.music.notListening");


		for(let i = player.queue.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[player.queue[i], player.queue[j]] = [player.queue[j], player.queue[i]];
		}

		return t("commands.shuffle");
	},
	guildOnly: true
};
