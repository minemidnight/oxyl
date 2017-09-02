const superagent = require("superagent");
module.exports = async () => {
	let guilds = (await process.output({
		type: "all_shards",
		input: () => bot.guilds.size
	})).results.reduce((a, b) => a + b);

	if(!bot.config.bot.postStats) return;
	if(bot.config.bot.dbotsKey) {
		try {
			await superagent.post(`https://bots.discord.pw/api/bots/${bot.user.id}/stats`)
				.set("Authorization", bot.config.bot.dbotsKey)
				.send({ server_count: guilds }); // eslint-disable-line camelcase
		} catch(err) {
			console.error(`Error posting to Discord Bots: ${err.stack}`);
		}
	}

	if(bot.config.bot.dbotsOrgKey) {
		try {
			await superagent.post(`https://discordbots.org/api/bots/${bot.user.id}/stats`)
				.set("Authorization", bot.config.bot.dbotsKey)
				.send({ server_count: guilds }); // eslint-disable-line camelcase
		} catch(err) {
			console.error(`Error posting to Discord Bots (org): ${err.stack}`);
		}
	}

	if(bot.config.bot.carbonKey) {
		try {
			await superagent.post("https://www.carbonitex.net/discord/data/botdata.php")
				.send({ key: bot.config.bot.carbonKey, servercount: guilds });
		} catch(err) {
			console.error(`Error posting to Carbon: ${err.stack}`);
		}
	}
};
