const Oxyl = require("../oxyl.js"),
	framework = require("../framework.js"),
	yt = require("ytdl-core");
const bot = Oxyl.bot;
const ytKey = framework.config.private.googleKey;
exports.managers = {};

class MusicManager {
	constructor(guild) {
		this.guild = guild;
		this.id = guild.id;

		this.resetData();
		exports.managers[guild.id] = this;

		framework.getSetting(guild, "musicchannel").then(val => {
			this.musicChannel = guild.channels.get(val);
			if(!this.musicChannel) this.musicChannel = undefined;
		}).catch(() => {
			this.musicChannel = undefined;
		});
	}

	resetData() {
		this.data = {
			queue: [],
			playing: null,
			extraOptions: { repeat: false },
			processQueue: true
		};
	}

	toggleOption(option) {
		let optionValue = this.data.extraOptions[option];
		if(typeof optionValue !== "boolean") return null;

		optionValue = !optionValue;
		this.data.extraOptions[option] = optionValue;

		return optionValue;
	}

	destroy() {
		let connection = this.connection;
		if(connection) connection.disconnect();

		this.data.processQueue = false;
		this.connection.stopPlaying();
		delete exports.managers[this.id];
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

		this.data.processQueue = false;
		this.connection.stopPlaying();
		this.data.playing = null;
		this.data.queue = [];
		connection.disconnect();
		this.data.processQueue = true;
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
			return;
		} else if(this.data.playing && this.connection.playing) {
			return;
		} else if(!this.data.processQueue) {
			return;
		}

		let nextQueue = this.data.queue[0];
		if(!nextQueue) {
			this.end();
			return;
		} else {
			this.data.playing = nextQueue;
			var id = nextQueue.id;
			if(this.data.queue.length > 1) this.data.queue.shift();
			else this.data.queue = [];
			if(this.data.extraOptions.repeat) this.data.queue.push(this.data.playing);
		}

		try {
			var stream = yt(`http://www.youtube.com/watch?v=${id}`, { audioonly: true });
		} catch(err) {
			this.sendEmbed("error", `${nextQueue.title} (${nextQueue.id}) is not available in Canada, song skipped.`);
		}

		connection.play(stream);
		this.sendEmbed("playing", nextQueue);
	}

	async connect(channelID) { // eslint-disable-line consistent-return
		if(!channelID) throw new Error("No channel");
		else if(channelID.id)	channelID = channelID.id;
		if(!this.processQueue) this.processQueue = true;

		if(bot.voiceConnections.get(this.id) && !bot.voiceConnections.get(this.id).ended) return false;
		let connection = await bot.joinVoiceChannel(channelID);
		await connection.ready;
		connection.setVolume(0.15);
		this.connection = connection;

		connection.on("ready", () => connection);

		connection.on("end", () => {
			if(this.data.queue.length <= 0) this.end();
			else this.play();
		});

		connection.on("error", err => {
			this.sendEmbed("error", err);
		});

		connection.on("disconnect", () => {
			delete this.connection;
		});
	}

	sendEmbed(type, data) {
		if(!this.musicChannel) return;
		let embed;

		if(type === "playing") {
			embed = {
				title: "Now playing :arrow_forward:",
				description: `[**${data.title}**](http://youtube.com/watch?v=${data.id}) (${exports.getDuration(data.duration)})`,
				color: 0xFF0000,
				image: { url: `https://i.ytimg.com/vi/${data.id}/hqdefault.jpg` }
			};
		} else if(type === "error") {
			embed = {
				title: "Recieved Error :warning:",
				description: data.stack || data,
				footer: { text: "Please report this to the Support Server, if you believe it is a bot error" }
			};
		}

		this.musicChannel.createMessage({ embed });
	}
}
exports.Manager = MusicManager;

exports.getManager = (guild) => {
	if(guild.id) guild = guild.id;
	return exports.managers[guild];
};

exports.getDuration = (seconds) => {
	if(seconds >= 3600) var hours = Math.floor(seconds / 3600);
	var mins = Math.floor(seconds % 3600 / 60);
	var secs = Math.floor(seconds % 60);
	if(mins < 10) {
		mins = `0${mins}`;
	} if(secs < 10) {
		secs = `0${secs}`;
	}

	if(hours) return `${hours}:${mins}:${secs}`;
	else return `${mins}:${secs}`;
};

exports.ytType = (id) => {
	if(id.includes("http://") || id.includes("https://")) id = exports.ytID(id);
	if(id.length === 11 && id !== id.toLowerCase()) return "VIDEO";
	else if((id.startsWith("PL") || id.length === 34 || id.length === 32) && id !== id.toLowerCase()) return "PLAYLIST";
	else return "NONE";
};

exports.ytID = (url) => {
	var match = url.match(framework.config.options.music.youtubeRegex);
	if(match && match[1]) return match[1];
	else return "INVALID_URL";
};

exports.searchVideo = async (query) => {
	let url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1` +
		`&type=video&q=${escape(query)}&key=${ytKey}`;

	let body = await framework.getContent(url);
	if(body.indexOf("videoId") >= 0) {
		body = JSON.parse(body).items[0].id.videoId;
		return body;
	} else {
		return "NO_RESULTS";
	}
};

exports.playlistVideos = async (id, page = "", videos = []) => {
	if(id.startsWith("http://") || id.startsWith("https://")) id = exports.ytID(id);
	let url = `https://www.googleapis.com/youtube/v3/playlistItems?playlistId=${id}&maxResults=50&part=snippet` +
		`&nextPageToken&pageToken=${page}&fields=nextPageToken,items(snippet(resourceId(videoId)))&key=${ytKey}`;

	let body = await framework.getContent(url);

	body = JSON.parse(body);
	let items = body.items;

	for(var i = 0; i < items.length; i++) {
		videos.push(items[i].snippet.resourceId.videoId);
	}

	if(body.nextPageToken) return await exports.playlistVideos(id, body.nextPageToken, videos);
	else return videos;
};

exports.videoInfo = async (id) => {
	if(id.startsWith("http://") || id.startsWith("https://")) id = exports.ytID(id);
	let url = `https://www.googleapis.com/youtube/v3/videos?id=${id}&part=snippet,` +
		`contentDetails&fields=items(snippet(title),contentDetails(duration))&key=${ytKey}`;

	let body = await framework.getContent(url);
	body = JSON.parse(body).items[0];

	if(!body) {
		return "NO_ITEMS";
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

		return {
			id: id,
			title: body.snippet.title,
			duration: duration
		};
	}
};
