const EventEmitter = require("events").EventEmitter;
const request = require("request");
const bufferedStream = require("../modules/bufferedStream.js");
const mainResolver = require("../modules/audioResolvers/main.js");

class Player extends EventEmitter {
	constructor(guild, data) {
		super();
		this.id = guild.id;
		this.guild = guild;

		this.queue = data.queue || [];
		this.repeat = !!data.repeat;
		this.processQueue = !!data.processQueue;
		this.channel = data.channel || null;
		bot.players.set(guild.id, this);
		handlePlayer(this);
	}

	async addQueue(data) {
		if(!this.connection) return false;
		if(this.queue.length >= 2000) {
			let donator = (await r.table("donators").filter({ userID: this.guild.ownerID }))[0];
			if(!donator) {
				return "You cannot add any more songs! Your queue already has 2000 songs. " +
					"If you want an unlimited queue size, consider donating.";
			}
		}

		if(Array.isArray(data)) this.queue = this.queue.concat(data);
		else if(typeof data === "object") this.queue.push(data);
		if(!this.current) this.play();

		if(this.queue.length >= 2000) {
			let donator = (await r.table("donators").filter({ userID: this.guild.ownerID }).run())[0];
			if(!donator) {
				this.queue = this.queue.slice(0, (donator ? 10000 : 2000) - 1);
				if(!donator) {
					return "Your queue was added, but not fully. Your queue has been capped at 2000 songs. " +
						"If you want an unlimited queue size, consider donating.";
				}
			}
		}
		return true;
	}

	async connect(channelID) {
		if(this.connection) return false;
		else if(!this.processQueue) this.processQueue = true;

		let connection = this.connection = await bot.joinVoiceChannel(channelID);
		let errorHandler = err => this.emit("error", err);
		connection.on("error", errorHandler);

		connection.once("disconnect", () => {
			connection.removeListener("error", errorHandler);
			this.queue = [];
			this.destroyTimeout = setTimeout(() => this.destroy("inactivity"), 600000);
		});

		if(connection.ready) return true;
		else return new Promise((resolve, reject) => connection.once("ready", resolve(true)));
	}

	destroy(reason) {
		let connection = this.connection;
		if(connection) {
			connection.disconnect();
			connection.stopPlaying();
		}

		this.processQueue = false;
		bot.players.delete(this.id);
		this.emit("destroy", reason);
		delete this;
	}

	async play() {
		clearTimeout(this.destroyTimeout);
		let connection = this.connection;
		if(!connection) return;
		else if(!this.processQueue) return;
		else if(!this.current && connection.playing) connection.stopPlaying();

		let song = this.queue[0];
		if(!song) {
			this.destroy("no_queue");
			return;
		}

		if(this.queue.length > 1) this.queue.shift();
		else this.queue = [];

		if(!song.stream) song = await mainResolver.extract(song);
		if(song.stream === "NO_VALID_FORMATS") {
			this.emit("error", new Error("No suitable formats were found"));
			this.play();
			return;
		}

		let volume;
		if(song.live) volume = 1;
		else volume = 0.2;
		let stream, options = { encoderArgs: ["-af", `volume=${volume}`] };
		if(song.opus) {
			stream = bufferedStream(song.stream);
		} else {
			stream = song.stream;
			options.inputArgs = ["-reconnect", "1", "-reconnect_streamed", "1", "-reconnect_delay_max", "2"];
		}

		this.connection.play(stream, options);
		this.current = song;
		this.emit("playing", song);
		this.connection.once("end", () => {
			if(this.repeat) this.queue.push(this.current);
			setTimeout(this.play, 100);
		});
	}

	voiceCheck(member) {
		if(!member.voiceState || !member.voiceState.channelID || !this.connection) return false;
		else return member.voiceState.channelID === this.connection.channelID;
	}
}
module.exports = Player;

function handlePlayer(player) {
	let createMessage = embed => {
		if(!player.channel) return;
		else player.channel.createMessage({ embed });
	};

	player.on("playing", async song => {
		let embed = {
			description: `**${song.title}**`,
			image: { url: song.thumbnail },
			footer: { text: `ID: ${song.id} | Service: ${song.service}` },
			title: "▶ Now playing"
		};
		if(song.duration && !isNaN(song.duration)) embed.description += ` (${bot.utils.secondsToDuration(song.duration)})`;
		createMessage(embed);
	});

	player.on("error", async err => {
		createMessage({
			color: 0xF1C40F,
			description: err.stack || err.message,
			title: "⚠ Recieved Error"
		});
	});
}
