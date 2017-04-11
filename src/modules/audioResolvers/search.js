const request = require("request-promise");
const googleKeys = bot.privateConfig.googleKeys;
const ytResolver = require("../audioResolvers/youtube.js");
module.exports = async query => {
	let data = await request(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1` +
			`&type=video&q=${encodeURI(query)}&key=${googleKeys[Math.floor(Math.random() * googleKeys.length)]}`);
	if(~data.indexOf("videoId")) return ytResolver(`youtube.com/watch?v=${JSON.parse(data).items[0].id.videoId}`);
	else return "NO_RESULTS";
};
