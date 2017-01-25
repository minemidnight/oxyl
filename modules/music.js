const Oxyl = require("../oxyl.js"),
	framework = require("../framework.js"),
	yt = require("ytdl-core"),
	fs = require("fs");
const bot = Oxyl.bot;
const ytKey = framework.config.private.googleKey;

class MusicManager {
	constructor(guild, extraData) {
		this.guild = guild;
		this.id = guild.id;
		Oxyl.managers[guild.id] = this;

		if(extraData) {
			for(let i in extraData) {
				this[i] = extraData[i];
			}
		} else {
			this.resetData();
		}
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
		if(connection) {
			connection.disconnect();
			this.connection.stopPlaying();
		}

		this.data.processQueue = false;
		delete Oxyl.managers[this.id];
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
		}

		let stream = yt(`http://www.youtube.com/watch?v=${id}`, { audioonly: true });
		connection.setVolume(0.005);
		connection.play(stream);
		this.sendEmbed("playing", nextQueue);
	}

	async connect(channelID) { // eslint-disable-line consistent-return
		if(!channelID) throw new Error("No channel");
		else if(channelID.id)	channelID = channelID.id;
		if(!this.processQueue) this.processQueue = true;

		if(this.connection) return false;
		if(bot.voiceConnections.guilds[this.id] && !bot.voiceConnections.guilds[this.id].ended) return false;
		let connection = await bot.joinVoiceChannel(channelID);
		this.connection = connection;
		return new Promise((resolve, reject) => {
			if(connection.ready) {
				resolve(connection);
			} else {
				connection.once("ready", () => {
					resolve(connection);
				});
			}

			let error = err => this.sendEmbed("error", err);
			let end = () => {
				if(this.data.extraOptions.repeat) this.data.queue.push(this.data.playing);
				if(this.data.queue.length <= 0) this.end();
				else setTimeout(() => this.play(), 750);
			};

			connection.on("error", error);
			connection.on("end", end);

			connection.once("disconnect", () => {
				connection.removeListener("error", error);
				connection.removeListener("end", end);
				delete this.connection;
			});
		});
	}

	async sendEmbed(type, data) {
		if(!this.guild.musicChannel) return false;
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
				color: 0xF1C40F,
				description: data.stack || data,
				footer: { text: "Please report this to the Support Server if it is a bot issue" }
			};
		} else if(type === "restart") {
			embed = {
				title: "Oxyl Restarting :gear:",
				color: 0xAED6F1,
				description: "Oxyl is restarting. Your music will be paused then start playing again, from the start of the current song. This is intentional."
			};
		}

		return await this.guild.musicChannel.createMessage({ embed });
	}
}
exports.Manager = MusicManager;

exports.getManager = (guild) => {
	if(guild.id) guild = guild.id;
	return Oxyl.managers[guild];
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

exports.managerDump = () => {
	let managers = Object.keys(Oxyl.managers)
		.map(manager => Oxyl.managers[manager])
		.filter(manager => manager.data.playing && manager.connection)
		.map(manager => {
			let object = {};
			object.id = manager.id;
			object.data = manager.data;
			object.processQueue = manager.processQueue;
			object.channel = manager.connection ? manager.connection.channelID : undefined;
			return object;
		});

	fs.writeFileSync("./managers.json", JSON.stringify(managers));
};

exports.managerLoad = (managers) => {
	managers.forEach(async manager => {
		let guild = bot.guilds.get(manager.id);
		if(!guild || !manager.data.playing || !manager.channel) return;

		manager.data.queue.unshift(manager.data.playing);
		delete manager.data.playing;
		let newManager = new MusicManager(guild, {
			data: manager.data,
			processQueue: manager.processQueue
		});

		await newManager.connect(manager.channel);
		newManager.play();
	});
};

exports.isReady = () => {
	if(fs.existsSync("./managers.json")) {
		let data = fs.readFileSync("./managers.json").toString();
		exports.managerLoad(JSON.parse(data));
		fs.unlinkSync("./managers.json");
	}
};

exports.ytType = id => {
	if(id.includes("http://") || id.includes("https://")) id = exports.ytID(id);
	if(id.length === 11 && id !== id.toLowerCase()) return "VIDEO";
	else if((id.startsWith("PL") || id.length === 34 || id.length === 32) && id !== id.toLowerCase()) return "PLAYLIST";
	else return "NONE";
};

exports.ytID = url => {
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
