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
		token: framework.config.private.discordListKey,
		servers: bot.guilds.size
	};

	let options = {
		method: "POST",
		headers: {
			"User-Agent": "Super Agent/0.0.1",
			"Content-Type": "application/x-www-form-urlencoded"
		},
		form: stats
	};

	framework.getContent("https://bots.discordlist.net/api", options);
}

module.exports = () => {
	postdBots();
	postCarbon();
	postDiscordlist();
};
