const Player = require("../../modules/Player");

module.exports = {
	run: async ({ args: [position], guild, message: { member }, t }) => {
		const player = Player.getPlayer(guild.id);

		if(!player || !player.currentSong) return t("commands.music.notPlaying");
		else if(!player.isListening(member)) return t("commands.music.notListening");

		if(!player.queue.length) return t("commands.jump.noQueue");
		else if(position > player.queue.length) t("commands.jump.invalidPosition");

		player.queue.unshift(player.queue.slice(position - 1, 1)[0]);
		player.connection.stop();

		return t("commands.jump", { position });
	},
	guildOnly: true,
	args: [{
		type: "int",
		label: "queue position",
		min: 1
	}]
};
