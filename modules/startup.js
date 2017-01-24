const Oxyl = require("../oxyl.js"),
	framework = require("../framework.js");
const bot = Oxyl.bot;

bot.once("ready", () => {
	framework.consoleLog("Bot ready");
	bot.editStatus("online", { name: framework.config.messages.onlineGame });
	Oxyl.postStats();

	setTimeout(() => Oxyl.modScripts.music.isReady(), 7500);
});

bot.connect();
