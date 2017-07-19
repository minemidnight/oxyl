const autoplay = require("../../modules/audioResolvers/autoplay.js");
module.exports = {
	process: async message => {
		let donator = await r.db("Oxyl").table("donators").get(message.guild.ownerID).run();
		if(!donator) return __("commands.music.autoplay.donatorOnly", message);

		let player = bot.players.get(message.channel.guild.id);
		if(!player || !player.connection) {
			return __("phrases.noMusic", message);
		} else if(!player.voiceCheck(message.member)) {
			return __("phrases.notListening", message);
		} else if(!player.current) {
			return __("commands.music.autoplay.noMusicPlaying", message);
		} else {
			player.autoplay = !player.autoplay;
			if(!player.repeat && player.autoplay && player.current.service === "youtube") {
				player.queue.unshift(await autoplay(player.current.id));
			}

			return __("commands.music.autoplay.success", message,
				{ value: __(`words.${player.repeat ? "on" : "off"}`, message) });
		}
	},
	guildOnly: true,
	description: "Toggles the usage of autoplay (grab the autoplay video from Youtube and add to start of queue)"
};
