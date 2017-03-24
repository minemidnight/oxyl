const music = Oxyl.modScripts.music;
let dfmlist = ["electro-hub", "chill-corner", "korean-madness",
	"japanese-lounge", "classical", "retro-renegade",
	"metal-mix", "hip-hop", "electro-swing",
	"purely-pop", "rock-n-roll", "coffee-house-jazz"];
async function dfmPlaylist(name, manager, voiceChannel) {
	name = name.replace(/ /g, "-");
	if(name === "list") {
		return `Valid discord.fm playlists: ` +
			`${dfmlist.map(genre => framework.capitalizeEveryFirst(genre.replace(/-/g, " "))).join(", ")}`;
	}	else if(dfmlist.indexOf(name) === -1) {
		return "Invalid list, use dfm:list to view the list";
	} else {
		if(!manager.connection) await manager.connect(voiceChannel);
		let body = await framework.getContent(`https://temp.discord.fm/libraries/${name}/json`);
		body = JSON.parse(body);

		let soundcloud = [];
		body.forEach(video => {
			if(video.service === "YouTubeVideo") {
				manager.addQueue({
					service: "yt",
					id: video.identifier,
					title: video.title,
					duration: video.length,
					thumbnail: `https://i.ytimg.com/vi/${video.identifier}/hqdefault.jpg`
				});
			} else if(video.service === "SoundCloudTrack") {
				soundcloud.push(music.providers.queueData(video.url, manager.guild.shard.id));
			}
		});
		soundcloud = await Promise.all(soundcloud);
		soundcloud.forEach(track => manager.addQueue(track));

		return `:white_check_mark: Added discord.fm playlist \`${framework.capitalizeEveryFirst(name.replace(/-/g, " "))}\` to the queue`;
	}
}

async function playCmdProcess(message) {
	let result = await music.providers.queueData(message.argsPreserved[0], message.channel.guild.shard.id);
	if(typeof result === "object") return result;
	else if(result === "NO_RESULTS") return "Search returned no results";
	else if(result === "INVALID_TYPE") return "Please only link to SoundCloud songs and playlists";
	else if(result === "NO_ITEMS") return "Unexpected error";
	else return "Unknown error";
}

exports.cmd = new Oxyl.Command("play", async message => {
	let voiceChannel, editMsg, manager = music.getManager(message.channel.guild);
	if(message.member && message.member.voiceState && message.member.voiceState.channelID) {
		voiceChannel = message.channel.guild.channels.get(message.member.voiceState.channelID);
	} else {
		voiceChannel = undefined;
	}

	if(!voiceChannel) return "You are not in a voice channel";
	else if(!manager) manager = new music.Manager(message.channel.guild, { channel: message.channel });

	if(manager && manager.connection && !manager.voiceCheck(message.member)) {
		return "You must be listening to music to use this command";
	} else if(voiceChannel && !voiceChannel.permissionsOf(bot.user.id).has("voiceConnect")) {
		return "I cannot join that channel (no permissions)";
	} else if(voiceChannel && !voiceChannel.permissionsOf(bot.user.id).has("voiceSpeak")) {
		return "I cannot speak in that channel (no permissions)";
	} else if(message.args[0].startsWith("dfm:")) {
		return await dfmPlaylist(message.args[0].substring(4), manager, voiceChannel);
	} else {
		await message.channel.sendTyping();
		let data = await playCmdProcess(message);
		if(typeof data === "string") return data;

		let msg = await message.channel.createMessage(`Adding ${data.title ? `__${data.title}__` : "playlist"} to queue\n` +
			`_Reply with cancel in the next 10 seconds or the command will be processed, or continue to play now_`);
		let responses = await framework.awaitMessages(msg.channel, newMsg => {
			if(newMsg.author.id !== message.author.id) return false;
			else if(newMsg.content.toLowerCase() === "cancel") return true;
			else if(newMsg.content.toLowerCase() === "continue") return true;
			else return false;
		}, { maxMatches: 1, time: 10000 });

		if(responses && responses.length >= 1 && responses[0].content.toLowerCase() === "cancel") {
			msg.edit("Cancelled play command");
		} else {
			if(!manager.connection) await manager.connect(voiceChannel);
			manager.addQueue(data);

			msg.edit(`Added ${data.title ? `__${data.title}__` : "playlist"} to queue`);
		}
		return false;
	}
}, {
	guildOnly: true,
	type: "music",
	description: "Add a youtube video to the music queue",
	args: [{
		type: "text",
		label: "youtube/soundcloud link|search query|dfm:list/playlist name"
	}]
});
