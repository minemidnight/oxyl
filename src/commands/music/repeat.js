module.exports = {
	process: async message => {
		let player = bot.players.get(message.channel.guild.id);
		if(!player) {
			return "There is currently no music playing";
		} else if(!player.voiceCheck(message.member)) {
			return "You must be listening to music to use this command";
		} else {
			player.repeat = !player.repeat;
			return `Repeat is now ${player.repeat ? "en" : "dis"}abled`;
		}
	},
	guildOnly: true,
	description: "Toggle repeating of the queue"
};
