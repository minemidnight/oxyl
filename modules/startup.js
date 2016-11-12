const Discord = require("discord.js"),
	Oxyl = require("../oxyl.js");
const bot = Oxyl.bot,
	config = Oxyl.config;

bot.on("ready", () => {
	Oxyl.consoleLog(`Oxyl has started and is now ready.
	\nTimestamp: ${Oxyl.formatDate(new Date())}`, "important");
	bot.user.setGame(config.messages.onlineGame);
	bot.user.setStatus("online");
});

bot.on("reconnecting", () => {
	bot.user.setGame(config.messages.onlineGame);
	bot.user.setStatus("online");
	Oxyl.consoleLog(`Oxyl has reconnected to discord.
	\nTimestamp: ${Oxyl.formatDate(new Date())}`, "important");
});

bot.login(config.token);
