const music = Oxyl.modScripts.music;
const ytReg = framework.config.options.music.youtubeRegex;

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

		body.filter(video => video.service === "YouTubeVideo").forEach(video => {
			manager.addQueue({
				id: video.identifier,
				title: video.title,
				duration: video.length
			});
		});

		return `:white_check_mark: Added discord.fm playlist \`${framework.capitalizeEveryFirst(name.replace(/-/g, " "))}\` to the queue`;
	}
}

async function playCmdProcess(message) {
	let query = message.argsPreserved[0];
	let type = music.ytType(query);

	if(type === "NONE") {
		let searched = await music.searchVideo(query, message.channel.guild.shard.id);

		if(searched === "NO_RESULTS") return "No results found";
		let info = await music.videoInfo(searched, message.channel.guild.shard.id);
		return {
			type: "video",
			display: `__${info.title}__`,
			info
		};
	} else if(type === "PLAYLIST") {
		return {
			type: "playlist",
			display: "playlist",
			id: music.ytID(query)
		};
	} else if(type === "VIDEO") {
		try {
			let info = await music.videoInfo(music.ytID(query), message.channel.guild.shard.id);
			return {
				type: "video",
				display: `__${info.title}__`,
				info
			};
		} catch(err) {
			return "Invalid video ID";
		}
	} else {
		return "Unknown error";
	}
}

exports.cmd = new Oxyl.Command("play", async message => {
	let voiceChannel, editMsg, manager = music.getManager(message.channel.guild);
	if(message.member && message.member.voiceState && message.member.voiceState.channelID) {
		voiceChannel = message.channel.guild.channels.get(message.member.voiceState.channelID);
	} else {
		voiceChannel = undefined;
	}

	if(!voiceChannel) return "You are not in a voice channel";
	else if(!manager) manager = new music.Manager(message.channel.guild);

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

		let msg = await message.channel.createMessage(`Adding ${data.display} to queue\n` +
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
			manager.addQueue(data.info || data.id);

			msg.edit(`Added ${data.display} to queue`);
		}
		return false;
	}
}, {
	guildOnly: true,
	type: "music",
	description: "Add a youtube video to the music queue",
	args: [{
		type: "text",
		label: "yt video link/id|yt playlist link/id|search query|dfm:list/playlist name"
	}]
});
