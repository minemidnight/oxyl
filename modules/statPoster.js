const Oxyl = require("../oxyl.js"),
	framework = require("../framework.js"),
	querystring = require("querystring"),
	https = require("https");
const bot = Oxyl.bot;

module.exports = () => {
	let stats = querystring.stringify({ server_count: bot.guilds.size }); // eslint-disable-line camelcase

	let options = {
		hostname: `bots.discord.pw`,
		path: `/api/bots/${bot.user.id}/stats`,
		method: `POST`,
		headers: {
			"Content-Type": `application/json`,
			Authorization: framework.config.private.dBotsKey,
			"Content-Length": Buffer.byteLength(stats)
		}
	};

	let request = https.request(options, res => {
		res.setEncoding("utf8");
	});

	request.write(stats);
	request.end();
};
