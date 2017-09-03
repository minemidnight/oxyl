const superagent = require("superagent");
const googleKeys = bot.config.bot.googleKeys;

module.exports = async query => {
	let { body: { items: [{ id: { videoId } }] } } = await superagent
		.get(`https://www.googleapis.com/youtube/v3/search&maxResults=1`)
		.query({
			part: "snippet",
			q: query, // eslint-disable-line id-length
			maxResults: 1,
			type: "video",
			key: googleKeys[Math.floor(Math.random() * googleKeys.length)]
		});
	return videoId;
};
