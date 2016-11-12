const Discord = require("discord.js"),
	fs = require("fs"),
	Oxyl = require("../oxyl.js"),
	framework = require("../framework.js");
const bot = Oxyl.bot;

bot.on("guildCreate", (guild) => {
	var path = `../server-configs/${guild.id}.yml`;
	fs.writeFileSync(path, framework.defaultConfig);
	framework.consoleLog(`Created YML guild config file for ${guild} (\`${path}\`)`, "debug");
});

bot.on("guildDelete", (guild) => {
	var path = `../server-configs/${guild.id}.yml`;
	try {
		fs.unlinkSync(path);
	} catch(err) {
		return;
	}
	framework.consoleLog(`Deleted YML guild config file for ${guild} (\`${path}\`)`, "debug");
});
