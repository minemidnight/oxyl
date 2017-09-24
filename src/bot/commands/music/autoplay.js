const autoplay = require("../../modules/audio/autoplay.js");
module.exports = {
	process: async message => {
		let donator = await r.db("Oxyl").table("donators").get(message.channel.guild.ownerID).run();
		if(!donator) return __("commands.music.autoplay.donatorOnly", message);

		let player = bot.players.get(message.channel.guild.id);
		let current = await player.getCurrent();
		if(!player || !player.connection) {
			return __("phrases.noMusic", message);
		} else if(!player.voiceCheck(message.member)) {
			return __("phrases.notListening", message);
		} else if(!current) {
			return __("commands.music.autoplay.noMusicPlaying", message);
		} else {
			let options = await player.getOptions();
			options.autoplay = !player.options;
			if(!options.repeat && options.autoplay && current.uri.startsWith("https://www.youtube.com/")) {
				let queue = await player.getQueue();
				queue.unshift(await autoplay(current.identifier));
				await player.setQueue(queue);
			}

			await player.setOptions(options);
			return __("commands.music.autoplay.success", message,
				{ value: __(`words.${options.autoplay ? "on" : "off"}`, message) });
		}
	},
	guildOnly: true,
	description: "Toggles the usage of autoplay (grab the autoplay video from Youtube and add to start of queue)"
};
