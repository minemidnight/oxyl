module.exports = {
	process: async message => {
		let player = bot.players.get(message.channel.guild.id);
		if(!player) {
			return "There is currently no music playing";
		} else if(!player.voiceCheck(message.member)) {
			return "You must be listening to music to use this command";
		} else {
			player.destroy();
			return "Music stopped";
		}
	},
	guildOnly: true,
	aliases: ["music"],
	description: "Stop music in your channel"
};
