const yt = Promise.promisifyAll(require("youtube-dl"));
const streamResume = require("stream-resume");

const ytKeys = framework.config.private.googleKeys;
const clientIDs = { soundcloud: "2t9loNQH90kzJcsFCODdigxfp325aq4z" };
const regexes = {
	yt: /(?:youtube\.com.*(?:\?|&)(?:v|list)=|youtube\.com.*embed\/|youtube\.com.*v\/|youtu\.be\/)((?!videoseries)[a-zA-Z0-9_-]*)/,
	sc: /((https:\/\/)|(http:\/\/)|(www.)|(s))+(soundcloud.com\/)+[a-zA-Z0-9-.]+(\/)+[a-zA-Z0-9-.]+/,
	twitch: /https?:\/\/(?:www\.)?twitch\.tv/,
	pornhub: /https?:\/\/(?:(?:[a-z]+\.)?pornhub\.com\/(?:view_video\.php\?viewkey=|embed\/)|(?:www\.)?thumbzilla\.com\/video\/)[\da-z]+/
};

class ProviderData {
	async queueData(data) {
		let id, ytMatch;
		if(!data.indexOf("https://") || !data.indexOf("http://")) {
			let match = data.match(regexes.yt);
			if(!match) {
				if(regexes.sc.test(data)) return this.scData(data);
				else if(regexes.twitch.test(data)) return this.twitchData(data);
				else if(regexes.pornhub.test(data)) return this.pornHubData(data);
				else id = data;
			} else {
				id = match[1];
				ytMatch = true;
			}
		} else {
			id = data;
		}

		if(id.length === 11 && ytMatch) return this.ytData(id);
		else if(ytMatch) return this.ytPlaylist(id);
		else return this.searchVideo(id);
	}

	async ytData(id) {
		let data, format;
		try {
			data = await yt.getInfoAsync(id, [], { maxBuffer: Infinity });
		} catch(err) {
			return "NOT_FOUND";
		}

		if(data.is_live === "live") {
			// thx wolke for getting format to work this is from his repo https://github.com/rem-bot-industries/rem-v2/
			for(let i of data.formats) if(i.format_id === "94") format = i.url;
			if(!format) for(let i of data.formats) if(i.format_id === "93" || i.format_id === "95") format = i.url;
			if(!format) return "NO_VALID_FORMATS";

			return {
				service: "yt",
				id: id,
				title: data.title,
				thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
				live: true,
				stream: format
			};
		} else {
			let parts = data.duration.split(":").reverse();
			let seconds = parseInt(parts[0]) || 0;
			let minutes = parts[1] ? parseInt(parts[1]) * 60 : 0;
			let hours = parts[2] ? parseInt(parts[2]) * 3600 : 0;

			// thx wolke for getting format to work this is from his repo https://github.com/rem-bot-industries/rem-v2/
			for(let i of data.formats) if(i.format_id === "250" || i.format_id === "251" || i.format_id === "249") format = i.url;
			if(!format) {
				for(let i of data.formats) {
					if((i.ext === "mp4" && i.format_note === "DASH audio") || (i.ext === "webm" && i.format_note === "DASH audio")) format = i.url;
				}
			}
			if(!format) for(let i of data.formats) if(i.format_note === "DASH audio") format = i.url;
			if(!format) return "NO_VALID_FORMATS";

			return {
				service: "yt",
				id: id,
				title: data.title,
				duration: hours + minutes + seconds,
				thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
				stream: format
			};
		}
	}

	async ytPlaylist(id, page = "", videos = []) {
		let randomKey = ytKeys[Math.floor(Math.random() * ytKeys.length)];
		let url = `https://www.googleapis.com/youtube/v3/playlistItems?playlistId=${id}&maxResults=50&part=contentDetails` +
			`&nextPageToken&pageToken=${page}&fields=nextPageToken,items(contentDetails(videoId))&key=${randomKey}`;

		let body = await framework.getContent(url);
		body = JSON.parse(body);
		for(let item of body.items) videos.push(this.ytData(item.contentDetails.videoId));

		if(body.nextPageToken) return await this.ytPlaylist(id, body.nextPageToken, videos);
		videos = await Promise.all(videos);
		return videos;
	}

	async scData(url) {
		url = `http://api.soundcloud.com/resolve.json?url=${url}&client_id=${clientIDs.soundcloud}`;

		let body = await framework.getContent(url);
		body = JSON.parse(body);
		if(body.kind === "track") {
			return {
				service: "sc",
				id: body.id,
				title: body.title,
				duration: Math.round(body.duration / 1000),
				thumbnail: body.artwork_url
			};
		} else if(body.kind === "playlist") {
			let tracks = body.tracks.map(song => ({
				service: "sc",
				id: song.id,
				title: song.title,
				duration: Math.round(song.duration / 1000),
				thumbnail: song.artwork_url
			}));
			tracks.title = body.title;
			return tracks;
		} else {
			return "INVALID_TYPE";
		}
	}

	async pornHubData(link) {
		try {
			let data = await yt.getInfoAsync(link, [], { maxBuffer: Infinity });

			let parts = data.duration.split(":").reverse();
			let seconds = parseInt(parts[0]) || 0;
			let minutes = parts[1] ? parseInt(parts[1]) * 60 : 0;
			let hours = parts[2] ? parseInt(parts[2]) * 3600 : 0;

			return {
				service: "pornhub",
				id: data.id,
				title: data.fulltitle,
				thumbnail: data.thumbnail,
				duration: hours + minutes + seconds
			};
		} catch(err) {
			return "CHANNEL_OFFLINE";
		}
	}

	async twitchData(link) {
		try {
			let data = await yt.getInfoAsync(link, [], { maxBuffer: Infinity }), format;

			// thx wolke for getting format to work this is from his repo https://github.com/rem-bot-industries/rem-v2/
			for(let i of data.formats) if(i.format_id === "Audio_Only") format = i.url;
			if(!format) for(let i of data.formats) if(i.format_id === "Medium" || i.format_id === "High") format = i.url;
			if(!format) return "NO_VALID_FORMATS";

			return {
				service: "twitch",
				channel: data.uploader,
				title: `${data.description} - ${data.uploader}`,
				thumbnail: `https://static-cdn.jtvnw.net/previews-ttv/live_user_${data.uploader.toLowerCase()}-640x360.jpg`,
				live: true,
				stream: format
			};
		} catch(err) {
			return "CHANNEL_OFFLINE";
		}
	}

	async searchVideo(query) {
		let randomKey = ytKeys[Math.floor(Math.random() * ytKeys.length)];
		let url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1` +
			`&type=video&q=${escape(query)}&key=${randomKey}`;

		let body = await framework.getContent(url);
		if(~body.indexOf("videoId")) return this.ytData(JSON.parse(body).items[0].id.videoId);
		else return "NO_RESULTS";
	}

	durationFormat(seconds) {
		let parts = [];
		parts.push(seconds % 60);
		if(parts[0] < 10) parts[0] = `0${parts[0]}`;
		let minutes = Math.floor(seconds / 60);
		if(minutes > 0) {
			parts.push(minutes % 60);
			let hours = Math.floor(minutes / 60);
			if(hours > 0) {
				if(parts[1] < 10) parts[1] = `0${parts[1]}`;
				parts.push(hours);
			}
		} else {
			parts.push("00");
		}

		return parts.reverse().join(":");
	}

	async getStream(data) {
		if(typeof data !== "object") {
			throw new Error("Tried to play invalid song (video deleted?)");
		} else if(data.service === "sc") {
			let streamData = await framework.getContent(`https://api.soundcloud.com/i1/tracks/${data.id}/streams?client_id=${clientIDs.soundcloud}`);
			streamData = JSON.parse(streamData);
			if(!streamData.http_mp3_128_url) throw new Error("No suitable format from SoundCloud");
			else return streamData.http_mp3_128_url;
			// else return new Promise((resolve, reject) => streamResume.get(streamData.http_mp3_128_url, resolve));
		} else if(data.stream) {
			// return new Promise((resolve, reject) => streamResume.get(data.stream, resolve));
			return data.stream;
		} else {
			return new Error("No stream and/or invalid service");
		}
	}
}
module.exports = ProviderData;
