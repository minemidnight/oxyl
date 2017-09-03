const Player = require("../../structures/player.js");
const resolver = require("../../modules/audio/main.js");

const cheerio = require("cheerio");
const superagent = require("superagent");
let playlistsDisplay, playlistsFormat;
async function updateDFM() {
	playlistsDisplay = [];
	const $ = cheerio.load((await superagent.get("http://temp.discord.fm/")).text); // eslint-disable-line id-length
	$("li.collection-item.avatar span").each((i, ele) => playlistsDisplay.push($(ele).text()));
	playlistsDisplay = playlistsDisplay.map(genre => genre.substring(0, genre.indexOf("(") - 1));
	playlistsFormat = playlistsDisplay.map(genre => genre.toLowerCase().replace(/ /g, "-"));
}
updateDFM();
setInterval(updateDFM, 3600000);

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
			if(message.args[0] === "list") {
				return __("commands.music.play.dfmPlaylists", message, { genres: playlistsDisplay.join(", ") });
			} else if(~playlistsFormat.indexOf(message.args[0].replace(/ /g, "-"))) {
				if(!player.connection) await player.connect(voiceChannel.id);
				let { body: data } = await superagent
					.get(`https://temp.discord.fm/libraries/${message.args[0].replace(/ /g, "-")}/json`);

				let res = await player.addQueue(data.map(video => {
					if(video.service === "YouTubeVideo") {
						return {
							identifier: video.identifier,
							length: video.length * 1000,
							title: video.title,
							uri: `https://www.youtube.com/watch?v=${video.identifier}`
						};
					} else if(video.service === "SoundCloudTrack") {
						return {
							identifier: video.identifier,
							length: video.length * 1000,
							title: video.title,
							uri: video.url
						};
					} else {
						return {};
					}
				}));
				if(typeof res === "string") return res;

				let display = playlistsDisplay[playlistsFormat.indexOf(message.args[0].replace(/ /g, "-"))];
				return __("commands.music.play.addedDFM", message, { genre: display });
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
