const request = require("request-promise");
const main = require("../audioResolvers/main.js");
module.exports = async link => {
	let id = link.match(regex)[1], data;
	try {
		data = JSON.parse(await request(`https://www.youtube.com/list_ajax?style=json&action_get_list=1&list=${id}`));
	} catch(err) {
		return "INVALID_ID";
	}
	if(!data || !data.video) return "INVALID_ID";

	let playlist = data.video.filter(song => song.privacy !== "private").map(song => ({
		duration: song.length_seconds,
		id: song.encrypted_id,
		service: "youtube",
		thumbnail: `https://i.ytimg.com/vi/${song.encrypted_id}/hqdefault.jpg`,
		title: song.title
	}));

	playlist[0] = await main.extract(playlist[0]);
	playlist.title = data.title;
	return playlist;
};
const regex = module.exports.regex = /(?:http|https|)(?::\/\/|)(?:www.|)(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/ytscreeningroom\?v=|\/feeds\/api\/videos\/|\/user\S*[^\w\-\s]|\S*[^\w\-\s]))([\w\-]{12,})[a-z0-9;:@#?&%=+\/\$_.-]*/; // eslint-disable-line max-len
