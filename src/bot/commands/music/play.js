const Player = require("../../structures/player.js");
const mainResolver = require("../../modules/audioResolvers/main.js");

const tts = require("google-tts-api");
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
		else if(!player) player = new Player(message.channel.guild, { channel: message.channel });

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

				let soundcloud = [], youtube = [];
				for(let video of data) {
					if(video.service === "YouTubeVideo") {
						youtube.push({
							duration: video.length,
							id: video.identifier,
							service: "youtube",
							thumbnail: `https://i.ytimg.com/vi/${video.identifier}/hqdefault.jpg`,
							title: video.title
						});
					} else if(video.service === "SoundCloudTrack") {
						soundcloud.push(mainResolver(video.url));
					}
				}

				let res = await player.addQueue(
					youtube.concat((await Promise.all(soundcloud)).filter(scData => typeof scData === "object"))
				);
				if(typeof res === "string") return res;

				let display = playlistsDisplay[playlistsFormat.indexOf(message.args[0].replace(/ /g, "-"))];
				return __("commands.music.play.addedDFM", message, { genre: display });
			} else {
				return __("commands.music.play.invalidDFM", message);
			}
		} else if(message.args[0].startsWith("tts:")) {
			message.args[0] = message.cleanContent.substring(4).trim();
			let url = await tts(message.args[0], "en");

			if(!player.connection) await player.connect(voiceChannel.id);
			await player.addQueue({
				service: "google-tts",
				title: "Text to Speech",
				stream: url
			});
			return __("commands.music.play.addedTTS", message);
		} else if(message.args[0].startsWith("sq:")) {
			message.args[0] = message.args[0].substring(3).trim();
			let donator = (await r.db("Oxyl").table("donators").filter({ id: message.author.id }).run())[0];
			if(!donator) return __("commands.music.play.donatorOnly", message);

			let queueNumber = parseInt(message.args[0]);
			if(!queueNumber || queueNumber < 1 || queueNumber > 3) {
				return __("commands.music.play.invalidSavedQueue", message);
			}

			let savedQueue = await r.table("savedQueues").get([queueNumber, message.author.id]).run();
			if(!savedQueue) return __("commands.music.play.noSavedQueue", message, { save: queueNumber });

			if(!player.connection) await player.connect(voiceChannel.id);
			await player.addQueue(await Promise.all(savedQueue.queue.map(mainResolver)));
			return __("commands.music.play.loadedSavedQueue", message, {
				save: queueNumber,
				itemCount: savedQueue.queue.length
			});
		} else {
			let result = await mainResolver(message.args[0]);
			if(typeof result === "object") {
				if(!player.connection) await player.connect(voiceChannel.id);
				let res2 = await player.addQueue(result);
				if(typeof res2 === "string") return res2;
				else return __("commands.music.play.addedItem", message, { title: result.title });
			} else if(result === "NO_VALID_FORMATS") {
				return __("commands.music.play.noFormats", message);
			} else if(result === "INVALID_ID") {
				return __("commands.music.play.invalidID", message);
			} else if(result === "NOT_FOUND") {
				return __("commands.music.play.notFound", message);
			} else if(result === "INVALID_TYPE") {
				return __("commands.music.play.invalidType", message);
			} else if(result === "CHANNEL_OFFLINE") {
				return __("commands.music.play.channelOffline", message);
			} else if(result === "NO_RESULTS") {
				return __("commands.music.play.noSearchResults", message);
			} else if(result === "INVALID_URL") {
				return __("commands.music.play.invalidURL", message);
			} else {
				return result;
			}
		}
	},
	caseSensitive: true,
	guildOnly: true,
	description: "Add items to the music queue",
	args: [{
		type: "text",
		label: "link|search query|dfm:<playlist>/list|tts:<text>"
	}]
};
