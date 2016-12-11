const Oxyl = require("../oxyl.js"),
	framework = require("../framework.js");
const bot = Oxyl.bot;

bot.on("guildCreate", guild => {
	framework.consoleLog(`[GUILD JOIN] ${guild.name} (${guild.id})`, "servers");
});

bot.on("guildDelete", guild => {
	framework.consoleLog(`[GUILD LEAVE] ${guild.name} (${guild.id})`, "servers");
});
