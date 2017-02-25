const fs = require("fs"),
	Vibrant = require("node-vibrant"),
	ProviderData = require("../modules/musicProviders.js");
const providers = exports.providers = new ProviderData();

class MusicManager {
	constructor(guild, extraData) {
		this.guild = guild;
		this.id = guild.id;
		Oxyl.managers[guild.id] = this;

		if(extraData) for(let i in extraData) this[i] = extraData[i];
		else this.resetData();
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
		return providers.durationFormat(playTime);
	}

	voiceCheck(member) {
		if(!member.voiceState || !member.voiceState.channelID || !this.connection) return false;
		else return member.voiceState.channelID === this.connection.channelID;
	}

	async addQueue(data) {
		let connection = this.connection;
		if(!connection) return;

		if(Array.isArray(data) === "array") {
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

		if(!this.data) this.resetData();
		if(this.connection.playing && this.data.playing) return;
		else if(!this.data.playing && this.connection.playing) this.connection.stopPlaying();
		else if(this.data.playing && this.connection.playing) return;
		else if(!this.data.processQueue) return;

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
		}
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

		connection.once("disconnect", () => delete this.connection);
	}

	async sendEmbed(type, data) {
		if(!Oxyl.modScripts.commandHandler.musicchannels[this.id]) return false;
		if(this.connection) {
			let vm = this.guild.channels.get(this.connection.channelID).voiceMembers.filter(member => !member.user.bot).length;
			if(vm <= 0) return false;
		}

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

		return Oxyl.modScripts.commandHandler.musicchannels[this.id].createMessage({ embed });
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
