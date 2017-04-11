const request = require("request-promise");
const main = require("../audioResolvers/main.js");
module.exports = async link => {
	let id = link.match(regex)[1];
	let data = await request(`https://www.youtube.com/list_ajax?style=json&action_get_list=1&list=${id}`);
	if(!data || !data.video) return "INVALID_ID";
	else data = JSON.parse(data);

	let playlist = data.songs.filter(song => song.privacy !== "private").map(song => ({
		duration: song.length_seconds,
		id: song.encrypted_id,
		service: "youtube",
		thumbnail: `https://i.ytimg.com/vi/${song.encrypted_id}/hqdefault.jpg`,
		title: song.title
	}));
	playlist.songs[0] = await main.extract(playlist.songs[0]);
	playlist.title = data.title;
	return playlist;
};
const regex = module.exports.regex = /(?:http?s?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:(?:watch\?v=)?(?:[a-zA-Z0-9_-]+)(?:&list=)([a-zA-Z0-9_-]+)(?:&.*|)|(?:playlist\?list=)?([a-zA-Z0-9_-]+))/; // eslint-disable-line max-len
