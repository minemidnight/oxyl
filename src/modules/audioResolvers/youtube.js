const youtubedl = Promise.promisifyAll(require("youtube-dl"));
const request = require("request-promise");
const googleKeys = bot.privateConfig.googleKeys;
const main = require("../audioResolvers/main.js");

module.exports = async link => {
	let id = link.match(regex)[1], data;

	try {
		data = JSON.parse(await request(`https://www.googleapis.com/youtube/v3/videos?id=${id}&part=snippet,` +
				`contentDetails&fields=items(snippet(title,liveBroadcastContent),contentDetails(duration))` +
				`&key=${googleKeys[Math.floor(Math.random() * googleKeys.length)]}`)).items[0];
	} catch(err) {
		return "INVALID_ID";
	}

	if(data.liveBroadcastContent) {
		return module.exports.livestream(id);
	} else {
		let match = data.contentDetails.duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
		let hours = (parseInt(match[1]) || 0) * 3600;
		let minutes = (parseInt(match[2]) || 0) * 60;
		let seconds = parseInt(match[3]) || 0;

		return await main.extract({
			duration: hours + minutes + seconds,
			id,
			service: "youtube",
			thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
			title: data.snippet.title
		});
	}
};
const regex = module.exports.regex = /(?:http?s?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?([a-zA-Z0-9_-]+)(&.*|)/; // eslint-disable-line max-len

module.exports.livestream = async id => {
	let data = await youtubedl.getInfoAsync(id, [], { maxBuffer: Infinity }), format;
	for(let i of data.formats) if(i.format_id === "94") format = i.url;
	if(!format) for(let i of data.formats) if(i.format_id === "93" || i.format_id === "95") format = i.url;
	if(!format) return "NO_VALID_FORMATS";

	return {
		id,
		live: true,
		service: "youtube_live",
		stream: format,
		title: data.title,
		thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
	};
};
