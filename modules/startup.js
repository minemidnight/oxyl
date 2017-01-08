const Oxyl = require("../oxyl.js"),
	framework = require("../framework.js");

const bot = Oxyl.bot,
	config = framework.config;

bot.on("ready", () => {
	bot.editStatus("online", { name: config.messages.onlineGame });
	Oxyl.postStats();

	setTimeout(() => {
		for(let i in bot.voiceConnections.guilds) {
			bot.leaveVoiceChannel(bot.voiceConnections.guilds[i].channelID);
		}
	}, 5000);
});

bot.connect();
