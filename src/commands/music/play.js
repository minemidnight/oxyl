const Player = require("../../structures/player.js");
const mainResolver = require("../../modules/audioResolvers/main.js");

module.exports = {
	process: async message => {
		let voiceChannel, player = bot.players.get(message.channel.guild.id);
		if(message.member && message.member.voiceState && message.member.voiceState.channelID) {
			voiceChannel = message.channel.guild.channels.get(message.member.voiceState.channelID);
		} else {
			voiceChannel = undefined;
		}

		if(!voiceChannel) return "You are not in a voice channel";
		else if(!player) player = new Player(message.channel.guild, { channel: message.channel });

		if(player && player.connection && !player.voiceCheck(message.member)) {
			return "You must be listening to music to use this command";
		} else if(voiceChannel && !voiceChannel.permissionsOf(bot.user.id).has("voiceConnect")) {
			return "I cannot join that channel (no permissions)";
		} else if(voiceChannel && !voiceChannel.permissionsOf(bot.user.id).has("voiceSpeak")) {
			return "I cannot speak in that channel (no permissions)";
		// } else if(message.args[0].startsWith("dfm:")) {
		// 	return await dfmPlaylist(message.args[0].substring(4), player, voiceChannel);
		} else {
			let result = await mainResolver(message.args[0]);
			if(typeof result === "object") {
				if(!player.connection) await player.connect(voiceChannel.id);
				let res2 = await player.addQueue(result);
				if(typeof res2 === "string") return res2;
				else return `Added __${result.title}__ to the queue`;
			} else if(result === "NO_VALID_FORMATS") {
				return "No suitable formats were found";
			} else if(result === "INVALID_ID") {
				return "The ID from playlist/video link was invalid";
			} else if(result === "INVALID_TYPE") {
				return "Please only link to SoundCloud songs or playlists";
			} else if(result === "CHANNEL_OFFLINE") {
				return "That Twitch channel is offline";
			} else if(result === "NO_RESULTS") {
				return "No results from search query";
			} else {
				return result;
			}
		}
	},
	guildOnly: true,
	description: "Add items to the music queue",
	args: [{
		type: "text",
		label: "link|search query"
	}]
};
