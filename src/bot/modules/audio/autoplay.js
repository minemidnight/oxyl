const cheerio = require("cheerio");
const superagent = require("superagent");
const main = require(`${__dirname}/main.js`);

module.exports = async videoID => {
	const { text: html } = await superagent.get(`https://www.youtube.com/watch?v=${videoID}`);
	const $ = cheerio.load(html); // eslint-disable-line id-length

	let id = $(".autoplay-bar .content-wrapper .content-link").attr("href");
	id = id.substring(id.indexOf("=") + 1);
	return main(`https://www.youtube.com/watch?v=${id}`);
};
