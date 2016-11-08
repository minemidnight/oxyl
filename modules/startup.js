const Discord = require("discord.js"),
	Oxyl = require("../oxyl.js");
const bot = Oxyl.bot,
	config = Oxyl.config;

bot.on("ready", () => {
	Oxyl.consoleLog(`\nOxyl has started!
	\nTimestamp: ${Oxyl.formatDate(new Date())}`, "important");
	bot.user.setGame(config.messages.onlineGame);
	bot.user.setStatus("online");
	console.log("Oxyl has finished booting up and is now ready!");
});

bot.on("reconnecting", () => {
	bot.user.setGame(config.messages.onlineGame);
	bot.user.setStatus("online");
	Oxyl.consoleLog(`\nOxyl has reconnected to discord!
	\nTimestamp: ${Oxyl.formatDate(new Date())}`, "important");
});

bot.login(config.token);
