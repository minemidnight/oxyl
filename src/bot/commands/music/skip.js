const Player = require("../../modules/Player");

module.exports = {
	run: async ({ flags: { force }, guild, message: { member }, t, wiggle: { locals: { r } } }) => {
		const player = Player.getPlayer(guild.id);

		if(!player || !player.currentSong) return t("commands.music.notPlaying");
		else if(!player.isListening(member)) return t("commands.music.notListening");

		const voteSkip = await r.table("musicSettings")
			.get(guild.id)
			.default({ voteSkip: false })
			.getField("voteSkip")
			.run();

		if(!voteSkip || (force && member.permission.has("voiceMoveMembers"))) {
			const [next] = player.queue;
			player.connection.stop();
			if(next) return t("commands.skip", { title: next.title });
			else return t("commands.skip.queueEmpty");
		} else {
			const skipsNeeded = Math.ceil(guild.channels
				.get(member.voiceState.channelID)
				.voiceMembers
				.filter(mem => !mem.bot && !mem.voiceState.selfDeaf && !mem.deaf)
				.length / 3);

			player.voteSkips++;
			if(player.voteSkips === skipsNeeded) {
				const [next] = player.queue;
				player.connection.stop();
				if(next) return t("commands.skip", { title: next.title });
				else return t("commands.skip.queueEmpty");
			} else {
				return t("commands.skip.voteSkip", {
					count: player.voteSkips,
					needed: skipsNeeded
				});
			}
		}
	},
	guildOnly: true,
	flags: [{
		name: "force",
		short: "f",
		type: "boolean",
		default: false
	}]
};
