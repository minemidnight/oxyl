const Oxyl = require("../oxyl.js"),
	framework = require("../framework.js");
const bot = Oxyl.bot;

bot.once("ready", () => {
	bot.editStatus("online", { name: framework.config.messages.onlineGame });
	Oxyl.postStats();

	setTimeout(() => {
		for(let i in bot.voiceConnections.guilds) {
			i = bot.voiceConnections.guilds[i].channelID;
			if(Object.keys(bot.channelGuildMap).indexOf(i) !== -1) bot.leaveVoiceChannel(i);
		}
	}, 5000);
});

bot.connect();
