const superagent = require("superagent");
const playlist = require(`${__dirname}/playlist.js`);
const search = require(`${__dirname}/search.js`);

module.exports = async (query, i = 0) => {
	if(playlistRegex.test(query)) return playlist(query.match(playlistRegex)[1]);

	try {
		var { body } = await superagent.get(bot.config.lavalink.url)
			.set("Authorization", bot.config.lavalink.auth)
			.query({ identifier: query });
	} catch(err) {
		if(i) throw err;
		return module.exports(search(query), i + 1);
	}

	if(body && Array.isArray(body)) var data = [body];
	else throw new Error("No track resolved");
	return Object.assign(data.info, { track: data.track });
};

const playlistRegex = /^(?:http|https|)(?::\/\/|)(?:www.|)(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/ytscreeningroom\?v=|\/feeds\/api\/videos\/|\/user\S*[^\w\-\s]|\S*[^\w\-\s]))([\w\-]{12,})[a-z0-9;:@#?&%=+\/\$_.-]*/; // eslint-disable-line max-len
