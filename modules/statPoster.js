const Oxyl = require("../oxyl.js"),
	framework = require("../framework.js"),
	fs = require("fs"),
	os = require("os");

const bot = Oxyl.bot;

function postCarbon() {
	let stats = {
		key: framework.config.private.carbonKey,
		servercount: bot.guilds.size
	};

	let options = {
		method: "POST",
		json: true,
		body: stats
	};

	framework.getContent(`https://www.carbonitex.net/discord/data/botdata.php`, options);
}

function postdBots() {
	let stats = { server_count: bot.guilds.size }; // eslint-disable-line camelcase

	let options = {
		method: "POST",
		json: true,
		headers: { Authorization: framework.config.private.dBotsKey },
		body: stats
	};

	framework.getContent(`https://bots.discord.pw/api/bots/${bot.user.id}/stats`, options);
}

function postDiscordlist() {
	let stats = {
		token: framework.config.privae.discordListKey,
		servers: bot.guilds.size
	};

	let options = {
		method: "POST",
		json: true,
		body: stats
	};

	framework.getContent(`https://bots.discordlist.net/api`, options);
}

module.exports = () => {
	postdBots();
	postCarbon();
	// postDiscordlist();
};
