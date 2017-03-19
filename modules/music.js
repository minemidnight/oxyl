const fs = require("fs"),
	Vibrant = require("node-vibrant"),
	ProviderData = require("../modules/musicProviders.js");
const providers = exports.providers = new ProviderData();

class MusicManager {
	constructor(guild, data) {
		this.guild = guild;
		this.id = guild.id;
		Oxyl.managers[guild.id] = this;

		this.resetData();
		if(data) for(let i in data) this[i] = data[i];
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
			connection.stopPlaying();
		}

		this.data.processQueue = false;
		delete Oxyl.managers[this.id];
		Oxyl.statsd.gauge(`oxyl.streams`, Object.keys(Oxyl.managers).filter(man => Oxyl.managers[man].connection).length);
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
		Oxyl.statsd.gauge(`oxyl.streams`, Object.keys(Oxyl.managers).filter(man => Oxyl.managers[man].connection).length);
	}

	get playTime() {
		let connection = this.connection;
		if(!connection) return null;

		let playTime = Math.floor(connection.current.playTime / 1000);
		return providers.durationFormat(playTime);
	}

	voiceCheck(member) {
		if(!member.voiceState || !member.voiceState.channelID || !this.connection) return false;
		else return member.voiceState.channelID === this.connection.channelID;
	}

	async addQueue(data) {
		let connection = this.connection;
		if(!connection) return;

		if(Array.isArray(data)) {
			for(let song of data) this.data.queue.push(song);
		} else if(typeof data === "object") {
			this.data.queue.push(data);
		}

		if(!this.data.playing) this.play();
	}

	async play() {
		let connection = this.connection;
		if(!connection) return;
		else if(!connection.ready) await connectionReady(connection);

		else if(!this.data.processQueue) return;
		else if(!this.data.playing && connection.playing) connection.stopPlaying();

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

		try {
			let stream = await providers.getStream(nextQueue);
			connection.play(stream, { encoderArgs: ["-af", "volume=0.2"] });
			this.sendEmbed("playing", nextQueue);
		} catch(err) {
			this.sendEmbed("error", err);
			if(connection.playing) connection.stopPlaying();
			else this.play();
		}
	}

	async connect(channelID) { // eslint-disable-line consistent-return
		if(!channelID) throw new Error("No channel");
		else if(channelID.id)	channelID = channelID.id;
		if(!this.data.processQueue) this.data.processQueue = true;

		if(this.connection) return false;
		let connection = await bot.joinVoiceChannel(channelID);
		this.connection = connection;
		this.addListeners();
		Oxyl.statsd.gauge(`oxyl.streams`, Object.keys(Oxyl.managers).filter(man => Oxyl.managers[man].connection).length);
		return await connectionReady(connection);
	}

	addListeners() {
		let connection = this.connection;
		if(!connection) return;

		let errorHandler = err => this.sendEmbed("error", err);
		let endHandler = () => {
			if(this.data.extraOptions.repeat) this.data.queue.push(this.data.playing);
			if(this.data.queue.length <= 0) this.end();
			else setTimeout(() => this.play(), 500);
		};

		connection.on("error", errorHandler);
		connection.on("end", endHandler);

		connection.once("disconnect", () => {
			connection.removeListener("error", errorHandler);
			connection.removeListener("end", endHandler);
			delete this.connection;
		});
	}

	async sendEmbed(type, data) {
		if(!this.channel) return false;
		if(this.connection && this.guild.channels.has(this.connection.channelID)) {
			let vm = this.guild.channels.get(this.connection.channelID).voiceMembers.filter(member => !member.user.bot).length;
			if(vm <= 0) return false;
		}

		let messagesDisabled = await Oxyl.modScripts.sqlQueries.settings.get(this.guild, "disable-binding");
		if(messagesDisabled === "true") return false;

		let embed;
		if(type === "playing") {
			let thumbnail = data.thumbnail || `https://i.ytimg.com/vi/${data.id}/hqdefault.jpg`;
			let color = await getVibrant(thumbnail);

			embed = {
				title: "▶ Now playing",
				description: `**${data.title}** (${providers.durationFormat(data.duration)})`,
				color: color,
				image: { url: thumbnail },
				footer: { text: `ID: ${data.id}` }
			};
		} else if(type === "error") {
			if(!data) return false;
			embed = {
				title: "⚠ Recieved Error",
				color: 0xF1C40F,
				description: data.stack || data.message,
				footer: { text: "Please report this to the Support Server if it is a bot issue" }
			};
		} else if(type === "restart") {
			embed = {
				title: "⚙ Oxyl Restarting",
				color: 0xAED6F1,
				description: "Oxyl is restarting. Your music will be paused then start playing again, from the start of the current song. This is intentional."
			};
		}

		return this.channel.createMessage({ embed });
	}
}
exports.Manager = MusicManager;

function getVibrant(image) {
	return new Promise((resolve, reject) => {
		Vibrant.from(image).getPalette((err, result) => {
			if(err) return resolve(0xFF0000);
			let color = result.Vibrant.rgb;
			color = (color[0] << 16) + (color[1] << 8) + color[2];
			return resolve(parseInt(color, 10));
		});
	});
}

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

exports.managerDump = () => {
	let managers = Object.keys(Oxyl.managers)
		.map(manager => Oxyl.managers[manager])
		.filter(manager => manager.data.playing)
		.map(manager => ({
			id: manager.id,
			data: manager.data,
			channel: manager.channel.id,
			connectionID: manager.connection ? manager.connection.channelID : undefined
		}));

	fs.writeFileSync("./managers.json", JSON.stringify(managers));
};

exports.managerLoad = (managers) => {
	managers.forEach(async manager => {
		let guild = bot.guilds.get(manager.id);
		if(!guild || !manager.data.playing || !manager.connectionID) return;

		manager.data.queue.unshift(manager.data.playing);
		delete manager.data.playing;
		let newManager = new MusicManager(guild, {
			channel: guild.channels.get(manager.channel),
			data: manager.data
		});

		await newManager.connect(manager.connectionID);
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
