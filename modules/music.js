const Discord = require("discord.js"),
	Oxyl = require("../oxyl.js"),
	https = require("https"),
	yt = require("ytdl-core");
const bot = Oxyl.bot, config = Oxyl.config;
var defaultVolume = config.options.commands.defaultVolume;
var data = { queue: {}, current: {}, volume: {}, ytinfo: {} };

var getVideoId = (url) => {
	var videoId = url.split("v=")[1];
	var ampersandPosition = videoId.indexOf("&");
	if(ampersandPosition !== -1) {
		videoId = videoId.substring(0, ampersandPosition);
	}
	return videoId;
};

var addInfo = (videoId, guild) => {
	var ytInfo = data.ytinfo;
	var options = {
		host: "www.googleapis.com",
		path: `/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails&fields=items(snippet(title),contentDetails(duration))&key=${config.googleKey}`
	};
  // Return a promise for a then in play.js command
	return new Promise((resolve, reject) => {
		var request = https.request(options, (res) => {
			var ytData = "";
			res.on("data", (chunk) => {
				ytData += chunk;
			});
			res.on("end", () => {
				var info = JSON.parse(ytData).items[0], durationParsed = 0;
				var dur = info.contentDetails.duration;
				durationParsed += parseInt(dur.substring(dur.indexOf("T") + 1, dur.indexOf("M"))) * 60;
				durationParsed += parseInt(dur.substring(dur.indexOf("M") + 1, dur.length - 1));
				if(!ytInfo[guild.id]) {
					ytInfo[guild.id] = [];
				}
				ytInfo[guild.id][videoId] = {
					title: info.snippet.title,
					duration: durationParsed
				};
				resolve(ytInfo[guild.id][videoId]);
			});
			res.on("error", (err) => {
				Oxyl.consoleLog(`Error while contacting Youtube API:\n\`\`\`\n${err.stack}\n\`\`\``, "debug");
				reject("Error contacting Youtube API");
			});
		});
		request.end();
	});
};

// Use to assure user is in channel
var voiceCheck = (guildMember) => {
	var guild = guildMember.guild;
	if(guild.voiceConnection.channel.id !== guildMember.voiceChannel.channel.id) {
		return false;
	} else {
		return guildMember.voiceChannel;
	}
};

var getPlayTime = (guild) =>
	getDispatcher(guild).time
;

var processQueue = (guild, connection) => {
	var dispatcher = getDispatcher(guild);
	var queue = data.queue;
	var current = data.current;
	var volume = data.volume;
	if(!dispatcher && queue[guild.id].length > 0) {
		playVideo(queue[guild.id][0], guild, connection);
		queue[guild.id].splice(0);
	} else if(dispatcher && queue[guild.id].length <= 0) {
		connection.disconnect();
		delete queue[guild.id];
		delete volume[guild.id];
		delete current[guild.id];
	}
};

var addQueue = (url, guild, connection) => {
	if(!connection) { connection = guild.voiceConnection; }
	var queue = data.queue;
	if(!queue[guild.id]) {
		queue[guild.id] = [];
	}
	queue[guild.id].push(url);
	processQueue(guild, connection);
};

var endStream = (guild) => {
	var connection = getDispatcher(guild);
	if(!connection) { return; }

	connection.end();
};

var pauseStream = (guild) => {
	var connection = getDispatcher(guild);
	if(!connection) { return; }

	connection.pause();
};

var resumeStream = (guild) => {
	var connection = getDispatcher(guild);
	if(!connection) { return; }

	connection.resume();
};

var setVolume = (guild, newVolume) => {
	var connection = getDispatcher(guild);
	var volume = data.volume;
	if(newVolume > 100) {
		newVolume = 100;
	} else if(newVolume < 0) {
		newVolume = 0;
	}
	if(!connection) { return; }

	connection.setVolume(newVolume / 250);
	volume[guild.id] = newVolume;
};

var leaveVoice = (guild) => {
	guild.voiceConnection.disconnect();
};

var getDispatcher = (guild) =>
	guild.voiceConnection.player.dispatcher
;

var playVideo = (url, guild, connection) => {
	var queue = data.queue;
	var volume = data.volume;
	var current = data.current;
	var ytInfo = data.ytinfo;
	if(!volume[guild.id]) {
		volume[guild.id] = defaultVolume;
	}
	var playVolume = volume[guild.id] / 250;

	let stream = yt(url, { audioonly: true });
	var videoId = getVideoId(url);

	current[guild.id] = videoId;
	const dispatcher = connection.playStream(stream, { volume: playVolume });
	dispatcher.on("end", () => {
		delete current[guild.id];
		delete ytInfo[guild.id][videoId];
		setTimeout(() => { processQueue(guild, connection); }, 100);
	});
};

exports.getVideoId = getVideoId;
exports.addInfo = addInfo;
exports.voiceCheck = voiceCheck;
exports.getPlayTime = getPlayTime;
exports.processQueue = processQueue;
exports.data = data;
exports.addQueue = addQueue;
exports.endStream = endStream;
exports.pauseStream = pauseStream;
exports.resumeStream = resumeStream;
exports.setVolume = setVolume;
exports.leaveVoice = leaveVoice;
exports.getDispatcher = getDispatcher;
exports.playVideo = playVideo;
