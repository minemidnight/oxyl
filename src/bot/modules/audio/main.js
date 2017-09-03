const superagent = require("superagent");
const search = require(`${__dirname}/search.js`);
module.exports = async (query, searching = false) => {
	let { body } = await superagent.get(bot.config.lavalink.url)
		.set("Authorization", bot.config.lavalink.auth)
		.query({ identifier: query });

	if(body && Array.isArray(body)) {
		if(!body.length) {
			return module.exports(await search(query), true);
		} else if(body.length === 1) {
			let [data] = body;
			return Object.assign(data.info, { track: data.track });
		} else {
			return body.map(video => Object.assign({}, video.info, { track: video.track }));
		}
	} else {
		throw new Error("No track resolved");
	}
};
