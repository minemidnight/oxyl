const yt = require("ytdl-core"),
	fs = require("fs");
const ytKeys = framework.config.private.googleKeys;

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

	get playTime() {
		let connection = this.connection;
		if(!connection) return null;

		let playTime = Math.floor(connection.current.playTime / 1000);
		return exports.getDuration(playTime);
	}

	voiceCheck(member) {
		if(!member.voiceState || !member.voiceState.channelID || !this.connection) return false;
		else return member.voiceState.channelID === this.connection.channelID;
	}

	async addQueue(data) {
		let connection = this.connection;
		if(!connection) return;

		if(typeof data === "object") {
			this.data.queue.push(data);
		} else {
			let type = exports.ytType(data);
			if(type === "PLAYLIST") {
				let videos = await exports.playlistVideos(data, this.guild.shard.id);
				for(let video of videos) this.data.queue.push(video);
			} else if(type === "VIDEO") {
				this.data.queue.push(await exports.videoInfo(exports.ytID(data), this.guild.shard.id));
			} else {
				return;
			}
		}
		if(!this.data.playing) this.play();
	}

	async play() {
		let connection = this.connection;
		if(!connection) {
			return;
		} else if(!connection.ready) {
			await connectionReady(connection);
		}

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
		connection.play(stream, { encoderArgs: ["-af", "volume=0.2"] });
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
		this.addListeners();
		return await connectionReady(connection);
	}

	addListeners() {
		let connection = this.connection;
		if(!connection) return;

		connection.on("error", err => this.sendEmbed("error", err));
		connection.on("end", () => {
			if(this.data.extraOptions.repeat) this.data.queue.push(this.data.playing);
			if(this.data.queue.length <= 0) this.end();
			else setTimeout(() => this.play(), 250);
		});

		connection.once("disconnect", () => {
			delete this.connection;
		});
	}

	sendEmbed(type, data) {
		if(!Oxyl.modScripts.commandHandler.musicchannels[this.id]) return false;
		let vm = this.guild.channels.get(this.connection.channelID).voiceMembers.filter(member => !member.user.bot).length;
		if(vm <= 0) return false;
		let embed;

		if(type === "playing") {
			embed = {
				title: "▶ Now playing",
				description: `[**${data.title}**](http://youtube.com/watch?v=${data.id}) (${exports.getDuration(data.duration)})`,
				color: 0xFF0000,
				image: { url: `https://i.ytimg.com/vi/${data.id}/hqdefault.jpg` }
			};
		} else if(type === "error") {
			if(!data) return false;
			embed = {
				title: "⚠ Recieved Error",
				color: 0xF1C40F,
				description: data.stack || data,
				footer: { text: "Please report this to the Support Server if it is a bot issue" }
			};
		} else if(type === "restart") {
			embed = {
				title: "⚙ Oxyl Restarting",
				color: 0xAED6F1,
				description: "Oxyl is restarting. Your music will be paused then start playing again, from the start of the current song. This is intentional."
			};
		}

		return Oxyl.modScripts.commandHandler.musicchannels[this.id].createMessage({ embed });
	}
}
exports.Manager = MusicManager;

function connectionReady(connection) {
	return new Promise((resolve, reject) => {
		if(connection.ready) resolve(connection);
		else connection.once("ready", () => resolve(connection));
	});
}

exports.getManager = (guild) => {
	if(guild.id) guild = guild.id;
	return Oxyl.managers[guild];
};

exports.getDuration = (seconds) => {
	if(seconds >= 3600) var hours = Math.floor(seconds / 3600);
	var mins = Math.floor(seconds % 3600 / 60);
	var secs = Math.floor(seconds % 60);
	if(mins < 10) mins = `0${mins}`;
	if(secs < 10) secs = `0${secs}`;

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
	if(id.length === 11 && id !== id.toLowerCase() && !id.includes(" ")) return "VIDEO";
	else if(id.startsWith("PL") && (id.length === 34 || id.length === 32) && id !== id.toLowerCase() && !id.includes(" ")) return "PLAYLIST";
	else return "NONE";
};

exports.ytID = url => {
	let match = url.match(framework.config.options.music.youtubeRegex);
	if(match && match[1]) return match[1];
	else if(url.length === 11 && url !== url.toLowerCase() && !url.includes(" ")) return url;
	else if(url.startsWith("PL") && (url.length === 34 || url.length === 32) && url !== url.toLowerCase() && !url.includes(" ")) return url;
	else return "INVALID_URL";
};

exports.searchVideo = async (query, shard) => {
	let url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1` +
		`&type=video&q=${escape(query)}&key=${ytKeys[shard]}`;

	let body = await framework.getContent(url);
	if(body.indexOf("videoId") >= 0) {
		body = JSON.parse(body).items[0].id.videoId;
		return body;
	} else {
		return "NO_RESULTS";
	}
};

exports.playlistVideos = async (id, shard, page = "", videos = []) => {
	let url = `https://www.googleapis.com/youtube/v3/playlistItems?playlistId=${id}&maxResults=50&part=contentDetails` +
		`&nextPageToken&pageToken=${page}&fields=nextPageToken,items(contentDetails(videoId))&key=${ytKeys[shard]}`;

	let body = await framework.getContent(url);
	body = JSON.parse(body);
	for(let item of body.items) {
		videos.push(exports.videoInfo(item.contentDetails.videoId, shard));
	}

	if(body.nextPageToken) return await exports.playlistVideos(id, shard, body.nextPageToken, videos);
	videos = await Promise.all(videos);
	return videos;
};

exports.videoInfo = async (id, shard) => {
	let url = `https://www.googleapis.com/youtube/v3/videos?id=${id}&part=snippet,` +
		`contentDetails&fields=items(snippet(title),contentDetails(duration))&key=${ytKeys[shard]}`;

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
