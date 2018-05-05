const config = require("../../../config.json");
const superagent = require("superagent");

const players = new Map();
class Player {
	constructor(guild, wiggle) {
		this.guild = guild;
		this.queue = [];
		this.client = wiggle.erisClient;
		this.r = wiggle.locals.r;
		this.currentSong = null;
		this.repeat = false;
		this.voteSkips = 0;
		this.maxSongLength = null;
		this.textChannelID = null;
		this.playingMessages = null;

		players.set(this.guild.id, this);
	}

	get connection() {
		return this.client.voiceConnections.get(this.guild.id);
	}

	connect(channel) {
		return this.client.joinVoiceChannel(channel.id);
	}

	disconnect() {
		this.connection.removeAllListeners();
		this.client.leaveVoiceChannel(this.connection.channelId);

		if(this.disconnectTimeout) clearTimeout(this.disconnectTimeout);
		players.delete(this.guild.id);
	}

	async resolve(query, callback) {
		if(!/^http|(sc|yt)search/.test(query)) query = `ytsearch:${query}`;
		const isSearch = /^(sc|yt)search/.test(query);

		const { body } = await superagent.get(`${config.lavalink.url}/loadtracks`)
			.query({ identifier: query })
			.set("Authorization", config.lavalink.restPassword);

		if(!body || !body.length) {
			return "NOT_RESOLVED";
		} else if(body.length === 1 || isSearch) {
			if(callback && isSearch) {
				return await callback(body.slice(0, 5).map(track => Object.assign(track.info, { track: track.track })));
			} else {
				return Object.assign(body[0].info, { track: body[0].track });
			}
		} else {
			return body.map(track => Object.assign(track.info, { track: track.track }));
		}
	}

	async queueItem(item, callback) {
		if(this.queue.length >= 1500) return "QUEUE_LIMIT";

		item = await this.resolve(item, callback);
		if(typeof item === "string") {
			return item;
		} else if(Array.isArray(item)) {
			this.queue = this.queue.concat(item.filter(track => (track.length / 1000) < this.maxSongLength));
		} else if(this.maxSongLength && (item.length / 1000) > this.maxSongLength) {
			return "SONG_LENGTH";
		} else {
			this.queue.push(item);
		}

		if(this.queue.length >= 1500) this.queue.splice(1500);
		return item;
	}

	async play() {
		if(this.disconnectTimeout) clearTimeout(this.disconnectTimeout);
		if(!this.connection || this.connection.playing) return;
		else if(this.connection.paused) this.connection.setPause(false);

		let song = this.queue.shift();
		if(!song && !this.queue.length) {
			this.disconnectTimeout = setTimeout(() => this.disconnect(), 180000);
			return;
		} else if(!song) {
			setTimeout(() => this.play(), 250);
		} else if(!song.track) {
			song = await this.resolve(song.uri);
		}

		this.currentSong = song;
		this.connection.play(song.track);
		this.createPlayingMessage();

		this.connection.once("end", () => {
			if(this.repeat) this.queue.push(this.currentSong);
			this.currentSong = null;
			this.voteSkips = 0;
			this.connection.removeAllListeners();

			this.play();
		});

		this.connection.once("error", () => this.play());
	}

	async createPlayingMessage() {
		if(this.playingMessages === null) {
			this.playingMessages = await this.r.table("musicSettings")
				.get(this.guild.id)
				.default({ musicMessages: true })
				.getField("musicMessages")
				.run();

			this._playingMessages = this.playingMessages;
		}

		if(!this.playingMessages) return;
		const embed = {
			author: { name: "Now Playing" },
			description: `**[${this.currentSong.title}](${this.currentSong.uri})** ` +
				`(${Player.formatDuration(this.currentSong.length / 1000)})`
		};

		const thumbnail = this.getThumbnail();
		if(thumbnail) embed.image = { url: thumbnail };

		this.client.createMessage(this.textChannelID, { embed });
	}

	getThumbnail() {
		const { identifier, uri } = this.currentSong;
		if(/^(https?:\/\/)?www\.youtube\.com\//.test(uri)) {
			return `https://img.youtube.com/vi/${identifier}/mqdefault.jpg`;
		} else if(/^(https?:\/\/)?twitch\.tv\//.test(uri)) {
			return `https://static-cdn.jtvnw.net/previews-ttv/live_user_${identifier}-320x180.jpg`;
		} else {
			return undefined;
		}
	}

	move(channelID) {
		this.client.joinVoiceChannel(channelID);
	}

	isListening(member) {
		return this.connection &&
			member.voiceState &&
			!member.voiceState.selfDeaf &&
			!member.voiceState.deaf &&
			member.voiceState.channelID === this.connection.channelId;
	}

	static getPlayer(id) {
		return players.get(id);
	}

	static formatDuration(seconds) {
		const hours = Math.floor(seconds / 3600);
		const mins = Math.floor(seconds % 3600 / 60);
		return `${hours ? `${hours.toString().padStart(2, 0)}:${mins.toString().padStart(2, 0)}` : mins}:` +
			`${Math.floor(seconds % 3600 % 60).toString().padStart(2, 0)}`;
	}
}

setInterval(() => [...players.values()].forEach(player => {
	player.maxSongLength = null;
	player.playingMessages = null;
}), 600000);
module.exports = Player;
