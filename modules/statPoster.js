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

function sendSite() {
	let totalUsers = 0;
	bot.guilds.forEach((guild) => {
		totalUsers += guild.memberCount;
	});

	let usedMemory = process.memoryUsage().heapUsed;
	let totalMemory = os.totalmem();
	let usedPercent = `${((usedMemory / totalMemory) * 100).toFixed(2)}%`;
	usedMemory = `${(usedMemory / Math.pow(1024, 2)).toFixed(2)} MB`;
	totalMemory = `${(totalMemory / Math.pow(1024, 3)).toFixed(2)} GB`;

	let commands = Oxyl.commands, commandUses = 0;
	for(let cmdType in commands) {
		for(let cmd in commands[cmdType]) {
			commandUses += commands[cmdType][cmd].uses;
		}
	}

	let newContent = {
		commandUses: commandUses,
		commandCount: Oxyl.commands.size,
		startTime: bot.startTime,
		guildCount: bot.guilds.size,
		shardCount: bot.shards.size,
		channelCount: Object.keys(bot.channelGuildMap).length,
		userCount: totalUsers,
		memory: {
			percent: usedPercent,
			used: usedMemory,
			total: totalMemory
		}
	};

	let path = "./site/public/assets/data/stats.json";
	fs.writeFile(path, JSON.stringify(newContent));
}

module.exports = () => {
	postdBots();
	postCarbon();
	sendSite();
};
