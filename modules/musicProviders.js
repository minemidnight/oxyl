const yt = require("ytdl-core");
const ytKeys = framework.config.private.googleKeys;
const soundcloudClient = "fDoItMDbsbZz8dY16ZzARCZmzgHBPotA";
const regexes = {
	yt: /(?:youtube\.com.*(?:\?|&)(?:v|list)=|youtube\.com.*embed\/|youtube\.com.*v\/|youtu\.be\/)((?!videoseries)[a-zA-Z0-9_-]*)/,
	sc: /((https:\/\/)|(http:\/\/)|(www.)|(s))+(soundcloud.com\/)+[a-zA-Z0-9-.]+(\/)+[a-zA-Z0-9-.]+/
};

class ProviderData {
	async queueData(data, shard) {
		let id;
		if(!data.indexOf("https://") || !data.indexOf("http://")) {
			let match = data.match(regexes.yt);
			if(!match) {
				if(regexes.sc.test(data)) return this.scData(data);
				else id = data;
			} else {
				id = match[1];
			}
		} else {
			id = data;
		}

		if(id.length === 11 && id !== id.toLowerCase() && !id.includes(" ")) return this.ytData(id, shard);
		else if(id.startsWith("PL") && (id.length === 34 || id.length === 32) && id !== id.toLowerCase() && !id.includes(" ")) return this.ytPlaylist(id, shard);
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
		let hours = (parseInt(match[1]) || 0) * 3600;
		let minutes = (parseInt(match[2]) || 0) * 60;
		let seconds = parseInt(match[3]) || 0;

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
		url = `http://api.soundcloud.com/resolve.json?url=${url}&client_id=${soundcloudClient}`;

		let body = await framework.getContent(url);
		body = JSON.parse(body);
		if(body.kind !== "track") return "NOT_TRACK";

		return {
			service: "sc",
			id: body.id,
			title: body.title,
			duration: Math.round(body.duration / 1000),
			thumbnail: body.artwork_url
		};
	}

	async searchVideo(query, shard) {
		let url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1` +
			`&type=video&q=${escape(query)}&key=${ytKeys[shard]}`;

		let body = await framework.getContent(url);
		if(body.indexOf("videoId") >= 0) {
			body = JSON.parse(body).items[0].id.videoId;
			return body;
		} else {
			return "NO_RESULTS";
		}
	}

	durationFormat(seconds) {
		if(seconds >= 3600) var hours = Math.floor(seconds / 3600);
		let mins = Math.floor(seconds % 3600 / 60);
		let secs = Math.floor(seconds % 60);
		if(mins < 10) mins = `0${mins}`;
		if(secs < 10) secs = `0${secs}`;

		if(hours) return `${hours}:${mins}:${secs}`;
		else return `${mins}:${secs}`;
	}

	async getStream(data) {
		if(typeof data !== "object") {
			throw new Error("Tried to play invalid song");
		} else if(data.service === "sc") {
			let streamData = await framework.getContent(`https://api.soundcloud.com/i1/tracks/${data.id}/streams?client_id=${soundcloudClient}`);
			streamData = JSON.parse(streamData);
			if(!streamData.http_mp3_128_url) throw new Error("No mp3 format from soundcloud");
			else return streamData.http_mp3_128_url;
		} else if(data.service === "yt") {
			return yt(`http://www.youtube.com/watch?v=${data.id}`, { audioonly: true });
		} else {
			return new Error("Invalid service");
		}
	}
}
module.exports = ProviderData;
