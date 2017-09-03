const superagent = require("superagent");
module.exports = async query => {
	if(!/^http|(sc|yt)search/.test(query)) query = `ytsearch:${query}`;
	let { body } = await superagent.get(bot.config.lavalink.url)
		.set("Authorization", bot.config.lavalink.auth)
		.query({ identifier: query });

	if(body && Array.isArray(body) && body.length) {
		if(body.length === 1 || /^(sc|yt)search/.test(query)) {
			let [data] = body;
			return Object.assign(data.info, { track: data.track });
		} else {
			return body.map(video => Object.assign({}, video.info, { track: video.track }));
		}
	} else {
		return "NO_VIDEO";
	}
};
