const Oxyl = require("../oxyl.js"),
	framework = require("../framework.js"),
	configs = require("../modules/serverconfigs.js"),
	yt = require("ytdl-core");
const config = framework.config,
	bot = Oxyl.bot;
const ytKey = config.private.googleKey;
var defaultVolume = config.options.music.defaultVolume;
var ytReg = config.options.music.youtubeRegex;
var data = { queue: {}, current: {}, volume: {}, ytinfo: {}, options: {} };

exports.clearData = (guild) => {
	delete data.queue[guild.id];
	delete data.volume[guild.id];
	delete data.current[guild.id];
	delete data.options[guild.id];
	delete data.ytinfo[guild.id];
};

exports.createOptions = (guild) => {
	var options = data.options;
	options[guild.id] = [];
	options[guild.id].repeat = false;
	options[guild.id].dimmer = true;
	options[guild.id].dimmerSpeakers = 0;
};

exports.toggleRepeat = (guild) => {
	var options = data.options;
	if(!options[guild.id]) exports.createOptions(guild);

	options[guild.id].repeat = !options[guild.id].repeat;
	return options[guild.id].repeat;
};

exports.toggleDimmer = (guild) => {
	var options = data.options;
	if(!options[guild.id]) exports.createOptions(guild);

	options[guild.id].dimmer = !options[guild.id].dimmer;
	options[guild.id].dimmerSpeakers = 0;

	let connection = exports.getDispatcher(guild);
	if(connection && data.current[guild.id]) {
		let volume = data.volume[guild.id];
		if(data.options[guild.id].dimmerSpeakers <= 0) connection.setVolume(volume / 200);
	}
	return options[guild.id].dimmer;
};

exports.getUrlType = (url) => {
	var match = url.match(ytReg);
	if(!match || !match[1]) {
		return "NONE";
	} else if(match[1].length === 11) {
		return "VIDEO";
	} else {
		return "PLAYLIST";
	}
};

exports.getVideoId = (url) => {
	var match = url.match(ytReg);
	if(match && match[1]) {
		return match[1];
	} else {
		return "INVALID_URL";
	}
};
exports.getPlaylistId = exports.getVideoId;

exports.searchVideo = (query) => {
	let options = {
		host: "www.googleapis.com",
		path: `/youtube/v3/search?part=snippet&maxResults=1&type=video&q=${escape(query)}&key=${ytKey}`
	};

	return new Promise((resolve, reject) => {
		framework.getContent(options).then(body => {
			if(body.indexOf("videoId") >= 0) {
				body = JSON.parse(body).items[0].id.videoId;
				resolve(body);
			} else {
				resolve("NO_RESULTS");
			}
		});
	});
};

exports.addPlaylist = (playlistId, guild, connection, page) => {
	if(!page) {
		page = "";
	}

	let options = {
		host: "www.googleapis.com",
		path: `/youtube/v3/playlistItems?playlistId=${playlistId}&maxResults=50&part=snippet` +
				`&nextPageToken&pageToken=${page}&fields=nextPageToken,items(snippet(resourceId(videoId)))&key=${ytKey}`
	};

	framework.getContent(options).then(body => {
		body = JSON.parse(body);

		if(body.nextPageToken) {
			page = body.nextPageToken;
			exports.addPlaylist(playlistId, guild, connection, page);
		}

		body = body.items;
		for(var i = 0; i < body.length; i++) {
			let videoId = body[i].snippet.resourceId.videoId;

			exports.addInfo(videoId, guild).then(() => {
				exports.addQueue(videoId, guild, connection);
			});
		}
	});
};

exports.addInfo = (videoId, guild) => {
	let ytInfo = data.ytinfo;
	let options = {
		host: "www.googleapis.com",
		path: `/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails&fields=items(snippet(title),contentDetails(duration))&key=${ytKey}`
	};
  // Return a promise for a then in play.js command
	return new Promise((resolve, reject) => {
		framework.getContent(options).then(body => {
			body = JSON.parse(body).items[0];

			if(!body) {
				reject("couldn't get youtube data.");
			} else {
				let durationParsed = 0;
				let dur = body.contentDetails.duration;
				if(dur.includes("H")) {
					durationParsed += parseInt(dur.substring(dur.indexOf("T") + 1, dur.indexOf("H"))) * 3600;
					durationParsed += parseInt(dur.substring(dur.indexOf("H") + 1, dur.indexOf("M"))) * 60;
				} else if(dur.includes("M")) {
					durationParsed += parseInt(dur.substring(dur.indexOf("T") + 1, dur.indexOf("M"))) * 60;
				}
				durationParsed += parseInt(dur.substring(dur.indexOf("M") + 1, dur.indexOf("S")));

				if(!ytInfo[guild.id]) ytInfo[guild.id] = [];
				ytInfo[guild.id][videoId] = {
					title: body.snippet.title,
					duration: durationParsed
				};
				resolve(ytInfo[guild.id][videoId]);
			}
		});
	});
};

// Use to assure user is in channel
exports.voiceCheck = (guildMember) => {
	var guild = guildMember.guild;
	var channelMember = guildMember.voiceChannel;
	var channelBot = guild.voiceConnection;
	if(!channelMember || !channelBot) {
		return false;
	} else if(channelBot.channel.id !== channelMember.id) {
		return false;
	} else {
		return guildMember.voiceChannel;
	}
};

exports.getPlayTime = (guild) => exports.getDispatcher(guild).time;

exports.processQueue = (guild, connection) => {
	var queue = data.queue;
	var current = data.current;
	var volume = data.volume;
	if(!queue[guild.id]) {
		queue[guild.id] = [];
	}
	var queueLength = queue[guild.id].length;
	if(!current[guild.id] && queueLength > 0) {
		exports.playVideo(queue[guild.id][0], guild, connection);
		queue[guild.id] = queue[guild.id].slice(1);
	} else if(queueLength <= 0) {
		connection.disconnect();
		exports.clearData(guild);
	}
};

exports.sendEmbed = (guild, type, info) => {
	let channel = exports.getMusicChannel(guild), embed;
	if(!channel) return;
	if(type === "playing") {
		embed = {
			title: "Now Playing :arrow_forward:",
			description: `**${info.title}** (${exports.getDuration(info.duration)})`,
			url: `http://youtube.com/watch?v=${info.id}`,
			timestamp: new Date(),
			color: 0xFF0000,
			image: { url: `https://i.ytimg.com/vi/${info.id}/hqdefault.jpg` }
		};
	}
	channel.sendMessage("", { embed: embed });
};

exports.addQueue = (videoId, guild, connection) => {
	if(!connection) { connection = guild.voiceConnection; }
	var queue = data.queue;
	if(!queue[guild.id]) {
		queue[guild.id] = [];
	}
	queue[guild.id].push(videoId);
	exports.processQueue(guild, connection);
};

exports.endStream = (guild) => {
	var connection = exports.getDispatcher(guild);
	if(!connection) { return; }

	connection.end();
};

exports.pauseStream = (guild) => {
	var connection = exports.getDispatcher(guild);
	if(!connection) { return; }

	connection.pause();
};

exports.resumeStream = (guild) => {
	var connection = exports.getDispatcher(guild);
	if(!connection) { return; }

	connection.resume();
};

exports.setVolume = (guild, newVolume) => {
	var connection = exports.getDispatcher(guild);
	var volume = data.volume;
	if(newVolume > 100) {
		newVolume = 100;
	} else if(newVolume < 0) {
		newVolume = 0;
	}
	if(!connection) return;

	connection.setVolume(newVolume / 200);
	volume[guild.id] = newVolume;
};

exports.leaveVoice = (guild) => {
	guild.voiceConnection.disconnect();
};

exports.getDispatcher = (guild) => {
	if(!guild.voiceConnection) {
		return false;
	} else if(!guild.voiceConnection.player.dispatcher) {
		return false;
	} else {
		return guild.voiceConnection.player.dispatcher;
	}
};

exports.getMusicChannel = (guild) => {
	let guildConfig = configs.getConfig(guild);
	let musicText = guildConfig.channels.musicText.value;
	if(musicText && guild.channels.get(musicText)) {
		return guild.channels.get(musicText);
	} else {
		return undefined;
	}
};

exports.playVideo = (videoId, guild, connection) => {
	var volume = data.volume;
	var current = data.current;
	var ytInfo = data.ytinfo;
	var options = data.options;
	if(!volume[guild.id]) {
		volume[guild.id] = defaultVolume;
	}
	var playVolume = volume[guild.id] / 200;
	current[guild.id] = videoId;

	let url = `http://youtube.com/watch?v=${videoId}`;
	let stream = yt(url, { audioonly: true });

	exports.sendEmbed(guild, "playing", {
		id: videoId,
		title: ytInfo[guild.id][videoId].title,
		duration: ytInfo[guild.id][videoId].duration
	});

	var dispatcher = connection.playStream(stream, { volume: playVolume });
	dispatcher.on("end", () => {
		delete current[guild.id];
		exports.processQueue(guild, connection);

		if(options[guild.id] && options[guild.id].repeat) {
			exports.addQueue(videoId, guild, connection);
		} else if(ytInfo[guild.id] && ytInfo[guild.id][videoId]) {
			delete ytInfo[guild.id][videoId];
		}
	});
};

exports.getDuration = (number) => {
	if(number >= 3600) {
		var hours = Math.floor(number / 3600);
	}
	var mins = Math.floor(number % 3600 / 60);
	var secs = Math.floor(number % 60);
	if(mins < 10) {
		mins = `0${mins}`;
	} if(secs < 10) {
		secs = `0${secs}`;
	}

	if(hours) {
		return `${hours}:${mins}:${secs}`;
	} else {
		return `${mins}:${secs}`;
	}
};

bot.on("guildMemberSpeaking", (member, speaking) => {
	let guild = member.guild;
	let current = data.current[guild.id];
	if(!current) return;
	if(!data.options[guild.id]) exports.createOptions(guild);
	if(!data.options[guild.id].dimmer) return;
	let connection = exports.getDispatcher(guild);

	if(speaking) {
		data.options[guild.id].dimmerSpeakers += 1;
	} else {
		data.options[guild.id].dimmerSpeakers -= 1;
	}

	let volume = data.volume[guild.id];
	if(data.options[guild.id].dimmerSpeakers <= 0) {
		connection.setVolume(volume / 200);
	} else {
		connection.setVolume((volume * 0.75) / 175);
	}
});

exports.data = data;
