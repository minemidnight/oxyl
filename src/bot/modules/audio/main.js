const superagent = require("superagent");
const playlist = require(`${__dirname}/playlist.js`);
const search = require(`${__dirname}/search.js`);

module.exports = async (query, search = false) => {
	if(playlistRegex.test(query)) return playlist(query.match(playlistRegex)[1]);

	let { body } = await superagent.get(bot.config.lavalink.url)
		.set("Authorization", bot.config.lavalink.auth)
		.query({ identifier: query });

	if(body && Array.isArray(body) && body.length) var data = [body];
	else if(!search) return module.exports(search(query), true);
	else throw new Error("No track resolved");

	data.info.track = data.track;
	return data.info;
};

const playlistRegex = /^(?:http|https|)(?::\/\/|)(?:www.|)(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/ytscreeningroom\?v=|\/feeds\/api\/videos\/|\/user\S*[^\w\-\s]|\S*[^\w\-\s]))([\w\-]{12,})[a-z0-9;:@#?&%=+\/\$_.-]*/; // eslint-disable-line max-len
