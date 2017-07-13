const EventEmitter = require("events").EventEmitter;
const mainResolver = require("../modules/audioResolvers/main.js");

class Player extends EventEmitter {
	constructor(guild, data) {
		super();
		this.id = guild.id;
		this.guild = guild;

		this.queue = data.queue || [];
		this.repeat = !!data.repeat;
		this.channel = data.channel || null;
		bot.players.set(this.id, this);
		handlePlayer(this);
	}

	async addQueue(data) {
		if(!this.connection) return false;
		if(this.queue.length >= 2000) {
			let donator = (await r.db("Oxyl").table("donators").filter({ id: this.guild.ownerID }))[0];
			if(!donator) return __("modules.player.maxQueue", this.guild);
		}

		if(Array.isArray(data)) this.queue = this.queue.concat(data);
		else if(typeof data === "object") this.queue.push(data);
		if(!this.current) this.play();

		if(this.queue.length >= 2000) {
			let donator = (await r.db("Oxyl").table("donators").filter({ id: this.guild.ownerID }).run())[0];
			if(!donator) {
				this.queue = this.queue.slice(0, (donator ? 10000 : 2000) - 1);
				if(!donator) return __("modules.player.cutOffQueue", this.guild);
			}
		}
		return true;
	}

	async connect(channelID) {
		if(this.connection) return false;

		let connection = this.connection = await bot.joinVoiceChannel(channelID);
		updateStreamCount();

		connection.on("error", err => this.emit("error", err));
		connection.on("disconnect", () => {
			connection.removeAllListeners();
			this.queue = [];
			delete this.connection;
			updateStreamCount();
			this.destroyTimeout = setTimeout(() => this.destroy("inactivity"), 600000);
		});

		if(connection.ready) return true;
		else return new Promise((resolve, reject) => connection.once("ready", resolve(true)));
	}

	destroy(reason) {
		let connection = this.connection;
		if(connection) bot.leaveVoiceChannel(connection.channelID);
		bot.players.delete(this.id);

		this.emit("destroy", reason);
		delete this;
		updateStreamCount();
	}

	async play() {
		let connection = this.connection;
		if(!connection) return;
		else if(this.current && connection.playing) return;
		else if(!this.current && connection.playing) connection.stopPlaying();
		else if(!connection.playing && this.current) delete this.current;
		clearTimeout(this.destroyTimeout);

		let song = this.queue[0];
		if(!song && !this.current && !this.queue.length) {
			this.destroy("no_queue");
			return;
		} else if(!song) {
			setTimeout(() => this.play(), 100);
			return;
		}

		if(this.queue.length > 1) this.queue.shift();
		else this.queue = [];

		if(!song.stream) song = await mainResolver.extract(song);
		if(!song.stream) {
			this.emit("error", new Error(__("modules.player.extractionError", this.guild)));
			this.play();
			return;
		} else if(typeof song.stream === "string" && song.stream === "NO_VALID_FORMATS") {
			this.emit("error", new Error(__("modules.player.noFormats", this.guild)));
			this.play();
			return;
		} else if(typeof song.stream === "string" && song.stream.startsWith("ERROR:")) {
			this.emit("error", song.stream);
			this.play();
			return;
		}

		let volume;
		if(song.live) volume = 1;
		else volume = 0.3;
		let options = {};

		// if(song.opus) {
		// 	options.format = "webm";
		// 	options.frameDuration = 20;
		// } else {
		// 	options.encoderArgs = ["-af", `volume=${volume}`];
		// 	options.inputArgs = ["-reconnect", "1", "-reconnect_streamed", "1", "-reconnect_delay_max", "2"];
		// }
		// CPU Usage doesn't matter that much to me :)

		options.encoderArgs = ["-af", `volume=${volume}`];
		options.inputArgs = ["-reconnect", "1", "-reconnect_streamed", "1", "-reconnect_delay_max", "2"];

		connection.play(song.stream, options);
		this.current = song;
		this.emit("playing", song);
		this.connection.once("end", () => {
			if(this.repeat) {
				delete this.current.stream;
				this.queue.push(this.current);
			}

			if(this.queue.length === 0) this.destroy("no_queue");
			else setTimeout(() => this.play(), 100);
		});
	}

	voiceCheck(member) {
		if(!member.voiceState || !member.voiceState.channelID || !this.connection) return false;
		else return member.voiceState.channelID === this.connection.channelID;
	}
}
module.exports = Player;

async function updateStreamCount() {
	let streams = (await process.output({
		type: "globalEval",
		input: () => Array.from(bot.players.values()).filter(player => player.connection).length
	})).results.reduce((a, b) => a + b);
	statsd({ type: "gauge", stat: "streams", value: streams });
}

function handlePlayer(player) {
	let createMessage = async embed => {
		if(!player.channel || !player.connection) return;
		let announcements = (await r.table("settings").filter({ guildID: player.id, name: "musicmessages" }).run())[0];
		if(announcements && announcements.value) return;

		let listening = player.guild.channels.get(player.connection.channelID).voiceMembers
			.filter(member => !member.bot && !member.voiceState.selfDeaf).length;
		if(listening >= 1) player.channel.createMessage({ embed });
	};

	player.on("playing", async song => {
		let embed = {
			description: `**${song.title}**`,
			image: { url: song.thumbnail },
			footer: { text: `ID: ${song.id} | ${__("words.service", this.guild)}: ${song.service}` },
			title: `▶ ${__("phrases.nowPlaying", this.guild)}`
		};
		if(song.duration && !isNaN(song.duration)) embed.description += ` (${bot.utils.secondsToDuration(song.duration)})`;
		createMessage(embed);
	});

	player.on("error", async err => {
		createMessage({
			color: 0xF1C40F,
			description: err.stack || err.message,
			title: `⚠ ${__("phrases.recievedError", this.guild)}`
		});
	});
}
