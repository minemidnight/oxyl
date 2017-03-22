const yt = require("ytdl-core");
const ytKeys = framework.config.private.googleKeys;
const clientIDs = {
	soundcloud: "2t9loNQH90kzJcsFCODdigxfp325aq4z",
	twitch: "jzkbprff40iqj646a697cyrvl0zt2m6"
};
const regexes = {
	yt: /(?:youtube\.com.*(?:\?|&)(?:v|list)=|youtube\.com.*embed\/|youtube\.com.*v\/|youtu\.be\/)((?!videoseries)[a-zA-Z0-9_-]*)/,
	sc: /((https:\/\/)|(http:\/\/)|(www.)|(s))+(soundcloud.com\/)+[a-zA-Z0-9-.]+(\/)+[a-zA-Z0-9-.]+/,
	twitch: /https?:\/\/(?:www\.)?twitch\.tv/
};

class ProviderData {
	async queueData(data, shard) {
		let id, ytMatch;
		if(!data.indexOf("https://") || !data.indexOf("http://")) {
			let match = data.match(regexes.yt);
			if(!match) {
				if(regexes.sc.test(data)) return this.scData(data);
				else id = data;
			} else {
				id = match[1];
				ytMatch = true;
			}
		} else {
			id = data;
		}

		if(id.length === 11 && ytMatch) return this.ytData(id, shard);
		else if(ytMatch) return this.ytPlaylist(id, shard);
		else return this.searchVideo(id, shard);
	}

	async ytData(id, shard) {
		let url = `https://www.googleapis.com/youtube/v3/videos?id=${id}&part=snippet,` +
			`contentDetails&fields=items(snippet(title),contentDetails(duration))&key=${ytKeys[shard]}`;

		let body = await framework.getContent(url);
		body = JSON.parse(body).items[0];

		if(!body) return "NO_ITEMS";
		let duration = body.contentDetails.duration;

		let match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
		let hours = match && match[1] ? (parseInt(match[1]) || 0) * 3600 : 0;
		let minutes = match && match[2] ? (parseInt(match[2]) || 0) * 60 : 0;
		let seconds = match && match[3] ? parseInt(match[3]) || 0 : 0;

		return {
			service: "yt",
			id: id,
			title: body.snippet.title,
			duration: hours + minutes + seconds
		};
	}

	async ytPlaylist(id, shard, page = "", videos = []) {
		let url = `https://www.googleapis.com/youtube/v3/playlistItems?playlistId=${id}&maxResults=50&part=contentDetails` +
			`&nextPageToken&pageToken=${page}&fields=nextPageToken,items(contentDetails(videoId))&key=${ytKeys[shard]}`;

		let body = await framework.getContent(url);
		body = JSON.parse(body);
		for(let item of body.items) videos.push(this.ytData(item.contentDetails.videoId, shard));

		if(body.nextPageToken) return await this.ytPlaylist(id, shard, body.nextPageToken, videos);
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

	async searchVideo(query, shard) {
		let url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1` +
			`&type=video&q=${escape(query)}&key=${ytKeys[shard]}`;

		let body = await framework.getContent(url);
		if(body.indexOf("videoId") >= 0) return this.ytData(JSON.parse(body).items[0].id.videoId, shard);
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
			let streamData = await framework.getContent(`https://api.soundcloud.com/i1/tracks/${data.id}/streams?client_id=${clientIDs.sountcloud}`);
			streamData = JSON.parse(streamData);
			if(!streamData.http_mp3_128_url) throw new Error("No mp3 format from SoundCloud");
			else return streamData.http_mp3_128_url;
		} else if(data.service === "yt") {
			try {
				return yt(`http://www.youtube.com/watch?v=${data.id}`, { audioonly: true });
			} catch(err) {
				throw err;
			}
		} else {
			return new Error("Invalid service type");
		}
	}
}
module.exports = ProviderData;
