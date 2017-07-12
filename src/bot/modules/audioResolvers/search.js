const superagent = require("superagent");
const googleKeys = bot.config.googleKeys;
const ytResolver = require("../audioResolvers/youtube.js");
module.exports = async query => {
	let data = await superagent.get(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1` +
			`&type=video&q=${encodeURI(query)}&key=${googleKeys[Math.floor(Math.random() * googleKeys.length)]}`);
	if(~data.text.indexOf("videoId")) return ytResolver(`youtube.com/watch?v=${data.body.items[0].id.videoId}`);
	else return "NO_RESULTS";
};
