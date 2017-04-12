const Player = require("../../structures/player.js");
const mainResolver = require("../../modules/audioResolvers/main.js");

const cheerio = require("cheerio");
const request = require("request-promise");
let playlistsDisplay, playlistsFormat;
async function updateDFM() {
	playlistsDisplay = [];
	const $ = cheerio.load(await request("http://temp.discord.fm/")); // eslint-disable-line id-length
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

		if(!voiceChannel) return "You are not in a voice channel";
		else if(!player) player = new Player(message.channel.guild, { channel: message.channel });

		if(player && player.connection && !player.voiceCheck(message.member)) {
			return "You must be listening to music to use this command";
		} else if(voiceChannel && !voiceChannel.permissionsOf(bot.user.id).has("voiceConnect")) {
			return "I cannot join that channel (no permissions)";
		} else if(voiceChannel && !voiceChannel.permissionsOf(bot.user.id).has("voiceSpeak")) {
			return "I cannot speak in that channel (no permissions)";
		} else if(message.args[0].startsWith("dfm:")) {
			message.args[0] = message.args[0].substring(4).trim();
			if(message.args[0] === "list") {
				return `Discord.FM playlists: ${playlistsDisplay.join(", ")}`;
			} else if(~playlistsFormat.indexOf(message.args[0].replace(/ /g, "-"))) {
				if(!player.connection) await player.connect(voiceChannel.id);
				let data = JSON.parse(
					await request(`https://temp.discord.fm/libraries/${message.args[0].replace(/ /g, "-")}/json`)
				);

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
				return `Added Discord.FM playlist ${display} to queue`;
			} else {
				return "Invalid Discord.FM playlist, use `dfm:list` to view the list of playlists";
			}
		} else if(message.args[0].startsWith("sq:")) {
			message.args[0] = message.args[0].substring(3).trim();
			let donator = (await r.table("donators").filter({ id: message.author.id }).run())[0];
			if(!donator) return "You must be a donator to use saved queues!";

			let queueNumber = parseInt(message.args[0]);
			if(!queueNumber || queueNumber < 1 || queueNumber > 3) return "Invalid number! Valid numbers are 1, 2 or 3";

			let savedQueue = (await r.table("savedQueues").filter({
				savedID: queueNumber,
				userID: message.author.id
			}).run())[0];
			if(!savedQueue) return `There is no saved queue under #${queueNumber}`;

			if(!player.connection) await player.connect(voiceChannel.id);
			await player.addQueue(await Promise.all(savedQueue.queue.map(mainResolver)));
			return `Loaded queue #${queueNumber} (${savedQueue.queue.length} items)`;
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
			} else if(result === "NOT_FOUND") {
				return "The resource could not be found, perhaps it has been removed?";
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
	caseSensitive: true,
	guildOnly: true,
	description: "Add items to the music queue",
	args: [{
		type: "text",
		label: "link|search query|dfm:<playlist>/list"
	}]
};
