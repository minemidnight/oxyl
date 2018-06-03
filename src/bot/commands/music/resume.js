const Player = require("../../modules/Player");

module.exports = {
	run: async ({ guild, member, t }) => {
		const player = Player.getPlayer(guild.id);

		if(!player || !player.currentSong) return t("commands.music.notPlaying");
		else if(!player.isListening(member)) return t("commands.music.notListening");
		else if(!player.connection.paused) return t("commands.resume.notPaused");

		player.connection.setPause(false);
		return t("commands.resume");
	},
	guildOnly: true
};
