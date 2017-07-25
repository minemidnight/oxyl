const cheerio = require("cheerio");
const superagent = require("superagent");
const main = require("../audioResolvers/main.js");

module.exports = async videoID => {
	const { text: html } = await superagent.get(`https://www.youtube.com/watch?v=${videoID}`);
	const $ = cheerio.load(html); // eslint-disable-line id-length

	let title = $(".autoplay-bar .content-wrapper .title").text().trim();
	let id = $(".autoplay-bar .content-wrapper .content-link").attr("href");
	id = id.substring(id.indexOf("=") + 1);

	let duration = $(".autoplay-bar .thumb-wrapper .video-time").text();

	let match = duration.match(/(\d+:)?(\d+):(\d+)/);
	let hours = (parseInt(match[1]) || 0) * 3600;
	let minutes = (parseInt(match[2]) || 0) * 60;
	let seconds = parseInt(match[3]) || 0;

	return {
		duration: hours + minutes + seconds,
		id,
		service: "youtube",
		thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
		title
	};
};
