const superagent = require("superagent");
const playlist = require(`${__dirname}/playlist.js`);
const search = require(`${__dirname}/search.js`);

module.exports = async query => {
	if(playlistRegex.test(query)) return playlist(query.match(playlistRegex)[1]);

	try {
		let { body: [data] } = await superagent.get(bot.config.lavalink.url)
			.set("Authorization", bot.config.lavalink.auth)
			.query({ identifier: query });

		return Object.assign(data.info, { track: data.track });
	} catch(err) {
		return module.exports(search(query));
	}
};

const playlistRegex = /^(?:http|https|)(?::\/\/|)(?:www.|)(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/ytscreeningroom\?v=|\/feeds\/api\/videos\/|\/user\S*[^\w\-\s]|\S*[^\w\-\s]))([\w\-]{12,})[a-z0-9;:@#?&%=+\/\$_.-]*/; // eslint-disable-line max-len
