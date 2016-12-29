const Oxyl = require("../oxyl.js"),
	framework = require("../framework.js");

const bot = Oxyl.bot,
	config = framework.config;

bot.on("ready", () => {
	framework.consoleLog(`Oxyl is ready.\nTimestamp: ${framework.formatDate(new Date())}`, "startup");
	bot.editStatus("online", { name: config.messages.onlineGame });

	Oxyl.postStats();
});

bot.connect();
