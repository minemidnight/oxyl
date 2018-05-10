const Player = require("../../modules/Player");

module.exports = {
	run: async ({ args: [volume], guild, member, r, t }) => {
		const isPremium = await r.table("premiumServers")
			.get(guild.id)
			.default(false)
			.run();
		if(!isPremium) return t("errors.notPremium");

		const player = Player.getPlayer(guild.id);
		if(!player || !player.currentSong) return t("commands.music.notPlaying");
		else if(!player.isListening(member)) return t("commands.music.notListening");

		player.connection.setVolume(volume);
		return t("commands.volume", { volume });
	},
	guildOnly: true,
	args: [{
		type: "int",
		label: "volume",
		min: 0,
		max: 150
	}]
};
