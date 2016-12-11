const Oxyl = require("../oxyl.js"),
	framework = require("../framework.js");
const bot = Oxyl.bot,
	config = framework.config;

bot.on("ready", () => {
	framework.consoleLog(`Oxyl has started up.\nTimestamp: ${framework.formatDate(new Date())}`, "startup");
	bot.user.setGame(config.messages.onlineGame);
	bot.user.setStatus("online");
});

bot.on("reconnecting", () => {
	bot.user.setGame(config.messages.onlineGame);
	bot.user.setStatus("online");
	framework.consoleLog(`Oxyl has reconnected to discord.\nTimestamp: ${framework.formatDate(new Date())}`, "startup");
});

bot.login(config.private.token);
