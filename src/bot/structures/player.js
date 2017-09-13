const redis = bot.utils.redis;
const EventEmitter = require("events").EventEmitter;
const resolver = require("../modules/audio/main.js");
const autoplay = require("../modules/audio/autoplay.js");

class Player extends EventEmitter {
	constructor(guild, data = {}) {
		super();
		this.id = guild.id;
		this._guild = guild;

		if(data.channelID) this.setChannel(data.channelID);
		bot.players.set(this.id, this);
		handlePlayer(this);
	}

	get connection() {
		return bot.voiceConnections.get(this.id);
	}

	async connect(channelID) {
		if(this.connection) return false;

		await bot.voiceConnections.join(this.id, channelID);
		await this.setConnection(channelID);

		this.connection.on("error", err => this.emit("error", err));
		this.connection.on("disconnect", () => this.destroy("disconnect"));
		this.connection.on("end", async () => {
			let queue = await this.getQueue();

			let playerOptions = await this.getOptions();
			if(playerOptions.repeat) {
				queue.push(await this.getCurrent());
				await this.setQueue(queue);
			}

			if(!queue.length) this.destroy("no_queue");
			else setTimeout(() => this.play(), 100);
		});

		return true;
	}

	async addQueue(data) {
		if(!this.connection) return false;

		let current = await this.getCurrent();
		let queue = await this.getQueue();
		if(queue.length >= 1500) {
			let donator = await r.db("Oxyl").table("donators").get(this._guild.ownerID).run();
			if(!donator) return __("modules.player.maxQueue", this._guild);
		}

		if(Array.isArray(data)) queue = queue.concat(data);
		else if(typeof data === "object") queue.push(data);

		if(queue.length >= 1500) {
			let donator = await r.db("Oxyl").table("donators").get(this._guild.ownerID).run();
			if(!donator) {
				queue = queue.slice(0, (donator ? 10000 : 1500) - 1);
				await this.setQueue(queue);
				if(!donator) return __("modules.player.cutOffQueue", this._guild);
			}
		}

		await this.setQueue(queue);
		if(!current) setTimeout(() => this.play(), 100);
		return true;
	}

	async destroy(reason = "end") {
		let connection = this.connection;
		if(connection) {
			connection.removeAllListeners();
			if(connection.playing) connection.stop();
			if(bot.voiceConnections.has(this.id)) bot.voiceConnections.leave(this.id);
		}

		bot.players.delete(this.id);
		let keys = await redis.keys(`${redis.options.keyPrefix}player:*:${this.id}`);
		keys.forEach(key => redis.del(key.substring(redis.options.keyPrefix.length)));
	}

	async play(options) {
		let connection = this.connection;
		let current = await this.getCurrent();

		if(!connection || (current && connection.playing)) return;

		let queue = await this.getQueue();
		let song = queue[0];
		if(!song && !current && !queue.length) {
			this.destroy("no_queue");
			return;
		} else if(!song) {
			setTimeout(() => this.play(), 100);
			return;
		} else {
			queue.shift();
		}

		if(!song.track) song = await resolver(song.uri);

		let playerOptions = await this.getOptions();
		if(!playerOptions.repeat && playerOptions.autoplay && song.uri.startsWith("https://www.youtube.com/")) {
			queue.unshift(await autoplay(song.identifier));
		}

		await this.setQueue(queue);
		connection.play(song.track, options);

		this.setCurrent(song);
		this.emit("playing", song);
	}

	voiceCheck(member) {
		if(!member.voiceState || !member.voiceState.channelID || !this.connection) return false;
		else return member.voiceState.channelID === this.connection.channelId;
	}

	async getOptions() {
		let options = await redis.get(`player:options:${this.id}`);
		return options ? JSON.parse(options) : { autoplay: false, repeat: false };
	}

	async setOptions(options) {
		return await redis.set(`player:options:${this.id}`, JSON.stringify(options), "EX", 7200);
	}

	async getChannel() {
		let channel = await redis.get(`player:channel:${this.id}`);
		return channel ? this._guild.channels.get(channel) : undefined;
	}

	async setChannel(channelID) {
		return await redis.set(`player:channel:${this.id}`, channelID, "EX", 7200);
	}

	async getCurrent() {
		let current = await redis.get(`player:current:${this.id}`);
		return current ? JSON.parse(current) : undefined;
	}

	async setCurrent(song) {
		return await redis.set(`player:current:${this.id}`, JSON.stringify(song), "EX", 7200);
	}

	async getQueue() {
		let queue = await redis.get(`player:queue:${this.id}`);
		return queue ? JSON.parse(queue) : [];
	}

	async setQueue(queue) {
		return await redis.set(`player:queue:${this.id}`, JSON.stringify(queue), "EX", 7200);
	}

	async getConnection() {
		return await redis.get(`player:connection:${this.id}`);
	}

	async setConnection(channelID) {
		if(channelID === null) return await redis.del(`player:connection:${this.id}`);
		else return await redis.set(`player:connection:${this.id}`, channelID, "EX", 7200);
	}

	async getTime() {
		return await redis.get(`player:time:${this.id}`);
	}

	async setTime(time) {
		return await redis.set(`player:time:${this.id}`, time, "EX", 7200);
	}
}
module.exports = Player;

module.exports.resumeQueues = async () => {
	let keys = await redis.keys(`${redis.options.keyPrefix}player:queue:*`);
	keys.forEach(async key => {
		let id = key.substring(key.indexOf("queue:") + 6);
		if(!bot.guilds.has(id)) return;

		let player = new Player(bot.guilds.get(id));
		let connection = await player.getConnection();
		if(!connection) {
			let keys2 = await redis.keys(`${redis.options.keyPrefix}player:*:${id}`);
			keys2.forEach(key2 => redis.del(key2.substring(redis.options.keyPrefix.length)));
			return;
		}

		let current = await player.getCurrent();
		let options = await player.getOptions();
		let queue = await player.getQueue();
		let time = await player.getTime();

		queue.unshift(current);
		await player.connect(connection);
		await player.setQueue(queue);
		await player.setOptions(options);
		await player.play({ startTime: time && !isNaN(time) ? time : 0 });

		if(options.volume) player.connection.setVolume(options.volume);
		if(options.paused) {
			await new Promise(resolve => setTimeout(resolve, 1500));
			player.connection.setPause(true);
		}
	});
};

function handlePlayer(player) {
	let createMessage = async message => {
		if(!player.connection) return;

		let channel = await player.getChannel();
		if(!channel) return;

		let messageDisabled = await r.table("settings").get(["disable-music-messages", player.id]).run();
		if(messageDisabled && messageDisabled.value) return;

		let listening = player._guild.channels.get(player.connection.channelId).voiceMembers
			.filter(member => !member.bot && !member.voiceState.selfDeaf).length;
		if(listening >= 1) channel.createMessage(typeof message === "object" ? { embed: message } : message);
	};

	player.on("playing", async song => {
		let message = `${__("phrases.nowPlaying", this._guild)} **${song.title}**`;

		if(song.author && song.author !== "Unknown artist") message += ` by ${song.author}`;
		if(song.length && song.length < 900000000000000) {
			message += ` \`(${bot.utils.secondsToDuration(song.length / 1000)})\``;
		}
		createMessage(message);
	});

	player.on("error", async err => {
		createMessage({
			color: 0xF1C40F,
			description: err.stack || err.message,
			title: `⚠ ${__("phrases.recievedError", this._guild)}`
		});
	});
}
