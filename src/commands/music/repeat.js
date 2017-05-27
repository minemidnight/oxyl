module.exports = {
	process: async message => {
		let player = bot.players.get(message.channel.guild.id);
		if(!player || !player.connection) {
			return __("phrases.noMusic", message);
		} else if(!player.voiceCheck(message.member)) {
			return __("phrases.notListening", message);
		} else {
			player.repeat = !player.repeat;
			return __("commands.music.repeat.success", message,
				{ value: __(`words.${player.repeat ? "on" : "off"}`, message) });
		}
	},
	guildOnly: true,
	description: "Toggle repeating of the queue"
};
