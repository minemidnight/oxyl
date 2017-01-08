const Oxyl = require("../oxyl.js"),
	framework = require("../framework.js"),
	configs = require("../modules/serverconfigs.js"),
	yt = require("ytdl-core");
const config = framework.config,
	bot = Oxyl.bot;
const ytKey = config.private.googleKey;
const managers = {};
exports.managers = managers;

class MusicManager {
	constructor(guild) {
		this.guild = guild;
		this.id = guild.id;

		this.resetData();
		managers[guild.id] = this;

		let guildConfig = configs.getConfig(guild);
		let musicText = guildConfig.channels.musicText.value;
		if(musicText && guild.channels.get(musicText)) {
			this.musicTextChannel = guild.channels.get(musicText);
		} else {
			this.musicTextChannel = undefined;
		}
	}

	resetData() {
		this.data = {
			volume: config.options.music.defaultVolume,
			queue: [],
			playing: null,
			extraOptions: { repeat: false }
		};
	}

	toggleOption(option) {
		let optionValue = this.data.extraOptions[option];
		if(typeof optionValue !== "boolean") return null;

		optionValue = !optionValue;
		this.data.extraOptions[option] = optionValue;

		return optionValue;
	}

	updateVolume(newVolume) {
		if(newVolume) {
			if(newVolume > 100) newVolume = 100;
			else if(newVolume < 0) newVolume = 0;
			this.data.volume = newVolume;
		}

		let connection = this.connection;
		if(!connection) return;

		connection.setVolume(this.data.volume / 500);
	}

	destroy() {
		let connection = this.connection;
		if(connection) connection.disconnect();

		delete managers[this.id];
		delete this;
	}

	pause() {
		let connection = this.connection;
		if(!connection) return;

		connection.pause();
	}

	resume() {
		let connection = this.connection;
		if(!connection) return;

		connection.resume();
	}

	end() {
		let connection = this.connection;
		if(!connection) return;

		this.data.playing = null;
		connection.disconnect();
		delete this.connection;
	}

	parsedPlayTime() {
		let connection = this.connection;
		if(!connection) return null;

		let playTime = Math.floor(connection.playTime / 1000);
		return exports.getDuration(playTime);
	}

	voiceCheck(member) {
		if(!member.voiceState || !member.voiceState.channelID || !this.connection) return false;
		else return member.voiceState.channelID === this.connection.channelID;
	}

	addQueue(id) {
		let connection = this.connection;
		if(!connection) return;

		if(id.startsWith("http://") || id.startsWith("https://")) id = exports.ytID(id);
		let type = exports.ytType(id);

		if(type === "PLAYLIST") {
			exports.playlistVideos(id).then(videos => {
				for(let videoId of videos) {
					this.addQueue(videoId);
				}
			});
		} else if(type === "VIDEO") {
			exports.videoInfo(id).then(info => {
				this.data.queue.push(info);
				if(!this.data.playing) this.play(id);
			});
		}
	}

	play() {
		let connection = this.connection;
		if(!connection) return;

		if(!this.data.playing && this.connection.playing) {
			this.connection.stopPlaying();
		} else if(this.data.playing && !this.connection.playing) {
			this.data.playing = null;
		} else if(this.data.playing && this.connection.playing) {
			return;
		}

		let nextQueue = this.data.queue[0];
		if(!nextQueue) {
			this.end();
			return;
		} else {
			this.data.playing = nextQueue;
			var id = nextQueue.id;
			if(!this.data.extraOptions.repeat) this.data.queue.shift();
		}

		let stream = yt(`http://www.youtube.com/watch?v=${id}`, { audioonly: true });
		connection.play(stream, { inlineVolume: true });
		this.updateVolume();
		this.sendEmbed("playing", nextQueue);
	}

	connect(channelID) {
		return new Promise((resolve, reject) => {
			if(!channelID) reject("No channel");
			else if(channelID.id) channelID = channelID.id;

			bot.joinVoiceChannel(channelID).then(connection => {
				this.connection = connection;
				connection.on("ready", () => {
					resolve(connection);
				});
				setTimeout(() => {
					resolve(connection);
				}, 5000);

				connection.on("end", () => {
					if(this.data.queue.length <= 0) this.end();
					else this.play();
				});
			});
		});
	}

	sendEmbed(type, data) {
		if(!this.musicTextChannel) return;
		let embed;
		if(type === "playing") {
			embed = {
				title: "Now playing :arrow_forward:",
				description: `[**${data.title}**](http://youtube.com/watch?v=${data.id}) (${exports.getDuration(data.duration)})`,
				timestamp: new Date(),
				color: 0xFF0000,
				image: { url: `https://i.ytimg.com/vi/${data.id}/hqdefault.jpg` }
			};
		}
		this.musicTextChannel.createMessage({ embed: embed });
	}
}
exports.Manager = MusicManager;

exports.getManager = (guild) => {
	if(guild.id) guild = guild.id;
	return managers[guild];
};

exports.getDuration = (seconds) => {
	if(seconds >= 3600) {
		var hours = Math.floor(seconds / 3600);
	}
	var mins = Math.floor(seconds % 3600 / 60);
	var secs = Math.floor(seconds % 60);
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

exports.ytType = (id) => {
	if(id.includes("http://") || id.includes("https://")) id = exports.ytID(id);
	if(id.length === 11 && id !== id.toLowerCase()) {
		return "VIDEO";
	} else if((id.startsWith("PL") || id.length === 34 || id.length === 32) && id !== id.toLowerCase()) {
		return "PLAYLIST";
	} else {
		return "NONE";
	}
};

exports.ytID = (url) => {
	var match = url.match(config.options.music.youtubeRegex);
	if(match && match[1]) {
		return match[1];
	} else {
		return "INVALID_URL";
	}
};

exports.searchVideo = (query) => {
	let url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1` +
		`&type=video&q=${escape(query)}&key=${ytKey}`;

	return new Promise((resolve, reject) => {
		framework.getContent(url).then(body => {
			if(body.indexOf("videoId") >= 0) {
				body = JSON.parse(body).items[0].id.videoId;
				resolve(body);
			} else {
				resolve("NO_RESULTS");
			}
		});
	});
};

exports.playlistVideos = (id, page = "", videos = []) => {
	if(id.startsWith("http://") || id.startsWith("https://")) id = exports.ytID(id);
	let url = `https://www.googleapis.com/youtube/v3/playlistItems?playlistId=${id}&maxResults=50&part=snippet` +
		`&nextPageToken&pageToken=${page}&fields=nextPageToken,items(snippet(resourceId(videoId)))&key=${ytKey}`;

	return new Promise((resolve, reject) => {
		framework.getContent(url).then(body => {
			body = JSON.parse(body);
			let items = body.items;

			for(var i = 0; i < items.length; i++) {
				videos.push(items[i].snippet.resourceId.videoId);
			}

			if(body.nextPageToken) {
				exports.playlistVideos(id, body.nextPageToken, videos)
				.then(value => resolve(value));
			} else {
				resolve(videos);
			}
		});
	});
};

exports.videoInfo = (id) => {
	if(id.startsWith("http://") || id.startsWith("https://")) id = exports.ytID(id);
	let url = `https://www.googleapis.com/youtube/v3/videos?id=${id}&part=snippet,` +
		`contentDetails&fields=items(snippet(title),contentDetails(duration))&key=${ytKey}`;

	return new Promise((resolve, reject) => {
		framework.getContent(url).then(body => {
			body = JSON.parse(body).items[0];

			if(!body) {
				reject("NO_ITEMS");
			} else {
				let duration = 0;
				let dur = body.contentDetails.duration;
				if(dur.includes("H")) {
					duration += parseInt(dur.substring(dur.indexOf("T") + 1, dur.indexOf("H"))) * 3600;
					duration += parseInt(dur.substring(dur.indexOf("H") + 1, dur.indexOf("M"))) * 60;
				} else if(dur.includes("M")) {
					duration += parseInt(dur.substring(dur.indexOf("T") + 1, dur.indexOf("M"))) * 60;
				}
				duration += parseInt(dur.substring(dur.indexOf("M") + 1, dur.indexOf("S")));

				resolve({
					id: id,
					title: body.snippet.title,
					duration: duration
				});
			}
		});
	});
};
