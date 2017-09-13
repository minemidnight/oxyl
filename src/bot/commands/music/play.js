const Player = require("../../structures/player.js");
const resolver = require("../../modules/audio/main.js");

const cheerio = require("cheerio");
const superagent = require("superagent");
const fs = require("fs");
let dfm = fs.readdirSync(`${__dirname}/../../../../discordfm`).reduce((all, playlist) => {
	let listname = playlist.substring(0, playlist.lastIndexOf(".")).replace(/-/g, " ");
	all[listname] = `${__dirname}/../../../../discordfm/${playlist}`;
	require(all[listname]);

	return all;
}, {});

module.exports = {
	process: async message => {
		let voiceChannel, player = bot.players.get(message.channel.guild.id);
		if(message.member && message.member.voiceState && message.member.voiceState.channelID) {
			voiceChannel = message.channel.guild.channels.get(message.member.voiceState.channelID);
		} else {
			voiceChannel = undefined;
		}

		if(!voiceChannel) return __("commands.music.play.notInVoice", message);
		else if(!player) player = new Player(message.channel.guild, { channelID: message.channel.id });

		if(player && player.connection && !player.voiceCheck(message.member)) {
			return __("phrases.notListening", message);
		} else if(voiceChannel && !voiceChannel.permissionsOf(bot.user.id).has("voiceConnect")) {
			return __("phrases.cantJoin", message);
		} else if(voiceChannel && !voiceChannel.permissionsOf(bot.user.id).has("voiceSpeak")) {
			return __("phrases.cantSpeak", message);
		} else if(message.args[0].startsWith("dfm:")) {
			message.args[0] = message.args[0].substring(4).trim();
			let key = Object.keys(dfm).find(loopKey => loopKey.toLowerCase() === message.args[0]);
			if(message.args[0] === "list") {
				return __("commands.music.play.dfmPlaylists", message, { genres: Object.keys(dfm).join(", ") });
			} else if(key) {
				if(!player.connection) await player.connect(voiceChannel.id);
				let res = await player.addQueue(require(dfm[key]));

				if(typeof res === "string") return res;
				return __("commands.music.play.addedDFM", message, { genre: key });
			} else {
				return __("commands.music.play.invalidDFM", message);
			}
		} else if(message.args[0].startsWith("sq:")) {
			message.args[0] = message.args[0].substring(3).trim();
			let donator = await r.db("Oxyl").table("donators").get(message.author.id).run();
			if(!donator) return __("commands.music.play.donatorOnly", message);

			let queueNumber = parseInt(message.args[0]);
			if(!queueNumber || queueNumber < 1 || queueNumber > 3) {
				return __("commands.music.play.invalidSavedQueue", message);
			}

			let savedQueue = await r.table("savedQueues").get([queueNumber, message.author.id]).run();
			if(!savedQueue) return __("commands.music.play.noSavedQueue", message, { save: queueNumber });

			if(!player.connection) await player.connect(voiceChannel.id);
			await player.addQueue(savedQueue.queue);
			return __("commands.music.play.loadedSavedQueue", message, {
				save: queueNumber,
				itemCount: savedQueue.queue.length
			});
		} else {
			let result = await resolver(message.args[0]);
			if(result === "NO_VIDEO") return __("commands.music.play.noVideo", message);

			if(!player.connection) await player.connect(voiceChannel.id);
			let res2 = await player.addQueue(result);
			if(typeof res2 === "string") return res2;
			else if(result.title) return __("commands.music.play.addedItem", message, { title: result.title });
			else return __("commands.music.play.addedPlaylist", message, { items: result.length });
		}
	},
	caseSensitive: true,
	guildOnly: true,
	description: "Add items to the music queue",
	args: [{
		type: "text",
		label: "link|search query|dfm:<playlist>/list"
	}]
};
