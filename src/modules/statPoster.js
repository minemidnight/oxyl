const request = require("request-promise");
module.exports = async () => {
	let guilds = (await process.output({
		type: "globalEval",
		input: () => bot.guilds.size
	})).results.reduce((a, b) => a + b);

	statsd({ type: "gauge", stat: "guilds", value: guilds });
	if(bot.publicConfig.serverChannel && !bot.publicConfig.beta) {
		bot.editChannel(bot.publicConfig.serverChannel, { topic: `Server Count: ${guilds}` }, "Update server count");
	}

	if(!bot.publicConfig.postStats) return;
	if(bot.privateConfig.dbotsKey) {
		try {
			await request({
				body: { server_count: guilds }, // eslint-disable-line camelcase
				headers: { Authorization: bot.privateConfig.dbotsKey },
				json: true,
				method: "POST",
				url: `https://bots.discord.pw/api/bots/${bot.user.id}/stats`
			});
		} catch(err) {
			console.error(`Error posting to Discord Bots: ${err.stack}`);
		}
	}

	if(bot.privateConfig.carbonKey) {
		try {
			await request({
				body: { key: bot.privateConfig.carbonKey, servercount: guilds }, // eslint-disable-line camelcase
				json: true,
				method: "POST",
				url: "https://www.carbonitex.net/discord/data/botdata.php"
			});
		} catch(err) {
			console.error(`Error posting to Carbon: ${err.stack}`);
		}
	}
};
