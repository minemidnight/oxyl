const Player = require("../../modules/Player");

module.exports = {
	run: async ({ args: [position], channel, guild, member, t }) => {
		const player = Player.getPlayer(guild.id);

		if(!player || !player.currentSong) return t("commands.music.notPlaying");
		else if(!member.voiceState || !member.voiceState.channelID) return t("commands.movehere.notInChannel");

		const moves = [];
		if(member.voiceState.channelID !== player.connection.channelId) {
			player.move(member.voiceState.channelID);
			moves.push();
		}

		if(channel.id !== player.textChannelID && player._playingMessages) {
			player.textChannelID = channel.id;
			moves.push(channel.mention);
		}

		return t("commands.movehere", { locations: moves.join(" and ") });
	},
	guildOnly: true
};
