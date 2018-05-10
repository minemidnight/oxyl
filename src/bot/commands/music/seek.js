const Player = require("../../modules/Player");

module.exports = {
	run: async ({ args: [seconds], guild, member, t }) => {
		const player = Player.getPlayer(guild.id);

		if(!player || !player.currentSong) return t("commands.music.notPlaying");
		else if(!player.isListening(member)) return t("commands.music.notListening");

		if(player.currentSong.length / 1000 < seconds) {
			return t("commands.seek.cantSeek", { max: Math.floor(player.currentSong.length / 1000) });
		} else if(player.currentSong.isStream) {
			return t("commands.seek.isStream");
		}

		player.connection.seek(seconds * 1000);
		return t("commands.seek", { seconds });
	},
	guildOnly: true,
	args: [{
		type: "int",
		label: "seconds",
		min: 0
	}]
};
