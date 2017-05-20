module.exports = {
	process: async message => {
		let player = bot.players.get(message.channel.guild.id);
		if(!player) {
			return __("phrases.noMusic", message);
		} else if(!player.voiceCheck(message.member)) {
			return __("phrases.notListening", message);
		} else {
			player.destroy();
			return __("commands.music.end.success", message);
		}
	},
	guildOnly: true,
	aliases: ["music"],
	description: "Stop music in your channel"
};
