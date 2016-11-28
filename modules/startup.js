const Oxyl = require("../oxyl.js"),
	framework = require("../framework.js");
const bot = Oxyl.bot,
	config = framework.config;

bot.on("ready", () => {
	framework.consoleLog(`Oxyl has started and is now ready.
	\nTimestamp: ${framework.formatDate(new Date())}`, "important");
	bot.user.setGame(config.messages.onlineGame);
	bot.user.setStatus("online");
});

bot.on("reconnecting", () => {
	bot.user.setGame(config.messages.onlineGame);
	bot.user.setStatus("online");
	framework.consoleLog(`Oxyl has reconnected to discord.
	\nTimestamp: ${framework.formatDate(new Date())}`, "important");
});

bot.login(config.token);
