const Oxyl = require("../oxyl.js"),
	framework = require("../framework.js"),
	request = require("request");

const bot = Oxyl.bot;

function postCarbon() {
	let stats = {
		key: framework.config.private.carbonKey,
		servercount: bot.guilds.size
	};

	let options = {
		url: `https://www.carbonitex.net/discord/data/botdata.php`,
		method: "POST",
		json: true,
		body: stats
	};

	request(options);
}

function postdBots() {
	let stats = { server_count: bot.guilds.size }; // eslint-disable-line camelcase

	let options = {
		url: `https://bots.discord.pw/api/bots/${bot.user.id}/stats`,
		method: "POST",
		json: true,
		headers: { Authorization: framework.config.private.dBotsKey },
		body: stats
	};

	request(options);
}

module.exports = () => {
	postdBots();
	postCarbon();
};
