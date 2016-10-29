const Discord = require("discord.js"),
      Oxyl = require("../oxyl.js");
const bot = Oxyl.bot,
      config = Oxyl.config;

bot.on("ready", () => {
  ready = true;
	Oxyl.consoleLog("```" +
  "\n* Timestamp: " + Oxyl.formatDate(new Date()) +
  "\n* Guilds: " + bot.guilds.size +
  "\n* Text Channels: " + bot.channels.filter(c=>c.type === "text").size +
  "\n* Users: " + bot.users.size +
  "```", "important")
  bot.user.setGame(config["messages"]["onlineGame"]);
  bot.user.setStatus("online");
	console.log("Oxyl has finished booting up and is now ready!");
});

bot.on("reconnecting", () => {
  bot.user.setGame(config["messages"]["onlineGame"]);
  bot.user.setStatus("online");
  Oxyl.consoleLog("Oxyl has reconnected to Discord", "debug");
});

bot.login(config["token"]);
