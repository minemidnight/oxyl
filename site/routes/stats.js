const express = require("express"),
	framework = require("../../framework.js"),
	main = require("../website.js"),
	Oxyl = require("../../oxyl.js"),
	os = require("os");
const router = express.Router(); // eslint-disable-line new-cap

router.get("/", async (req, res) => {
	let totalUsers = 0, bot = Oxyl.bot;
	bot.guilds.forEach((guild) => {
		totalUsers += guild.memberCount;
	});

	let usedMemory = process.memoryUsage().heapUsed;
	let totalMemory = os.totalmem();
	let usedPercent = `${((usedMemory / totalMemory) * 100).toFixed(2)}%`;
	usedMemory = `${(usedMemory / Math.pow(1024, 3)).toFixed(2)} GB`;
	totalMemory = `${(totalMemory / Math.pow(1024, 3)).toFixed(2)} GB`;

	let commands = Oxyl.commands, commandUses = 0;
	for(let cmdType in commands) {
		for(let cmd in commands[cmdType]) {
			commandUses += commands[cmdType][cmd].uses;
		}
	}

	let data = {
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

	res.send(await main.parseHB("stats", req, data));
});

module.exports = router;
