const Redis = require("ioredis");
const redis = new Redis({ keyPrefix: bot.config.beta ? "oxylbeta." : "oxyl." });

const EventEmitter = require("events").EventEmitter;
const mainResolver = require("../modules/audioResolvers/main.js");
const autoplay = require("../modules/audioResolvers/autoplay.js");

class Player extends EventEmitter {
	constructor(guild, data) {
		super();
		this.id = guild.id;
		this.guild = guild;

		if(data.channelID) this.setChannel(data.channelID);
		bot.players.set(this.id, this);
		handlePlayer(this);
	}

	async addQueue(data) {
		if(!this.connection) return false;

		let current = await this.getCurrent();
		let queue = await this.getQueue();
		if(queue.length >= 1500) {
			let donator = await r.db("Oxyl").table("donators").get(this.guild.ownerID).run();
			if(!donator) return __("modules.player.maxQueue", this.guild);
		}

		if(Array.isArray(data)) queue = queue.concat(data);
		else if(typeof data === "object") queue.push(data);
		if(!current) this.play();

		if(queue.length >= 1500) {
			let donator = await r.db("Oxyl").table("donators").get(this.guild.ownerID).run();
			if(!donator) {
				queue = queue.slice(0, (donator ? 10000 : 1500) - 1);
				await this.setQueue(queue);
				if(!donator) return __("modules.player.cutOffQueue", this.guild);
			}
		}

		await this.setQueue(queue);
		return true;
	}

	async connect(channelID) {
		if(this.connection) return false;

		let connection = this.connection = await bot.joinVoiceChannel(channelID);
		await this.setConnection(channelID);
		updateStreamCount();

		connection.on("error", err => this.emit("error", err));
		connection.on("disconnect", async () => {
			connection.removeAllListeners();

			await this.setConnection(null);
			await this.setQueue([]);
			delete this.connection;
			updateStreamCount();
			this.destroyTimeout = setTimeout(() => this.destroy("inactivity"), 600000);
		});

		if(connection.ready) return true;
		else return new Promise(resolve => connection.once("ready", resolve));
	}

	async destroy(reason) {
		let connection = this.connection;
		if(connection) bot.leaveVoiceChannel(connection.channelID);
		this.emit("destroy", reason);
		bot.players.delete(this.id);

		let keys = await redis.keys(`${redis.options.keyPrefix}*.${this.id}`);
		keys.forEach(key => redis.del(key.substring(redis.options.keyPrefix.length)));

		delete this;
		updateStreamCount();
	}

	async play() {
		let connection = this.connection;
		let current = await this.getCurrent();

		if(!connection) return;
		else if(current && connection.playing) return;
		else if(!current && connection.playing) connection.stopPlaying();
		else if(!connection.playing && current) redis.del(`current.${this.id}`);

		if(!bot.players.has(this.id) && connection) bot.players.set(this.id, this);

		clearTimeout(this.destroyTimeout);
		let queue = await this.getQueue();
		let song = queue[0];
		if(!song && !current && !queue.length) {
			this.destroy("no_queue");
			return;
		} else if(!song) {
			setTimeout(() => this.play(), 100);
			return;
		}

		if(queue.length > 1) queue.shift();
		else queue = [];

		if(!song.stream) song = await mainResolver.extract(song);
		if(!song.stream) {
			this.emit("error", new Error(__("modules.player.extractionError", this.guild)));
			await this.setQueue(queue);
			this.play();
			return;
		} else if(typeof song.stream === "string" && song.stream === "NO_VALID_FORMATS") {
			this.emit("error", new Error(__("modules.player.noFormats", this.guild)));
			await this.setQueue(queue);
			this.play();
			return;
		} else if(typeof song.stream === "string" && song.stream.startsWith("ERROR:")) {
			this.emit("error", song.stream);
			await this.setQueue(queue);
			this.play();
			return;
		}

		let volume;
		if(song.live) volume = 1;
		else volume = 0.3;
		let options = {};

		options.encoderArgs = ["-af", `volume=${volume}`];
		options.inputArgs = ["-reconnect", "1", "-reconnect_streamed", "1", "-reconnect_delay_max", "2"];

		let playerOptions = await this.getOptions();
		if(!playerOptions.repeat && playerOptions.autoplay && song.service === "youtube") {
			queue.unshift(await autoplay(song.id));
		}

		await this.setQueue(queue);
		connection.play(song.stream, options);
		if(!bot.players.has(this.id) && connection) bot.players.set(this.id, this);

		this.setCurrent(song);
		this.emit("playing", song);
		this.connection.once("end", async () => {
			playerOptions = await this.getOptions();
			if(playerOptions.repeat) {
				delete song.stream;

				queue = await this.getQueue();
				queue.push(song);
				await this.setQueue(queue);
			}

			if(queue.length === 0) this.destroy("no_queue");
			else setTimeout(() => this.play(), 100);
		});
	}

	voiceCheck(member) {
		if(!member.voiceState || !member.voiceState.channelID || !this.connection) return false;
		else return member.voiceState.channelID === this.connection.channelID;
	}

	async getOptions() {
		let options = await redis.get(`options.${this.id}`);
		return options ? JSON.parse(options) : { autoplay: false, repeat: false };
	}

	async setOptions(options) {
		return await redis.set(`options.${this.id}`, JSON.stringify(options), "EX", 86400);
	}

	async getChannel() {
		let channel = await redis.get(`channel.${this.id}`);
		return channel ? this.guild.channels.get(channel) : undefined;
	}

	async setChannel(channelID) {
		return await redis.set(`channel.${this.id}`, channelID, "EX", 86400);
	}

	async getCurrent() {
		let current = await redis.get(`current.${this.id}`);
		return current ? JSON.parse(current) : undefined;
	}

	async setCurrent(song) {
		return await redis.set(`current.${this.id}`, JSON.stringify(song), "EX", 86400);
	}

	async getQueue() {
		let queue = await redis.get(`queue.${this.id}`);
		return queue ? JSON.parse(queue) : [];
	}

	async setQueue(queue) {
		return await redis.set(`queue.${this.id}`, JSON.stringify(queue), "EX", 86400);
	}

	async getConnection() {
		return await redis.get(`connection.${this.id}`);
	}

	async setConnection(channelID) {
		return await redis.set(`connection.${this.id}`, channelID, "EX", 86400);
	}
}
module.exports = Player;

module.exports.resumeQueues = async () => {
	let keys = await redis.keys(`${redis.options.keyPrefix}queue.*`);
	keys.forEach(async key => {
		let id = key.substring(key.indexOf("queue.") + 6);
		if(!bot.guilds.has(id)) return;

		let player = new Player(bot.guilds.get(id));
		let connection = await player.getConnection();
		let current = await player.getCurrent();
		let options = await player.getOptions();
		let queue = await player.getQueue();

		queue.unshift(current);
		await player.connect(connection);
		await player.setQueue(queue);
		await player.setOptions(options);
		await player.play();

		if(options.paused) player.connection.pause();
	});
};

async function updateStreamCount() {
	let streams = (await process.output({
		type: "all_shards",
		input: () => [...bot.players.values()].filter(player => player.connection).length
	})).results.reduce((a, b) => a + b);
	statsd({ type: "gauge", stat: "streams", value: streams });
}

function handlePlayer(player) {
	let createMessage = async embed => {
		if(!player.connection) return;

		let channel = await player.getChannel();
		if(!channel) return;

		let messageDisabled = await r.table("settings").get(["disable-music-messages", player.id]).run();
		if(messageDisabled && messageDisabled.value) return;

		let listening = player.guild.channels.get(player.connection.channelID).voiceMembers
			.filter(member => !member.bot && !member.voiceState.selfDeaf).length;
		if(listening >= 1) channel.createMessage({ embed });
	};

	player.on("playing", async song => {
		let embed = {
			description: `**${song.title}**`,
			image: { url: song.thumbnail },
			footer: { text: `${__("words.service", this.guild)}: ${song.service}` },
			title: `▶ ${__("phrases.nowPlaying", this.guild)}`
		};

		if(song.id) embed.footer.text = `ID: ${song.id} |${embed.footer.text}`;
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
