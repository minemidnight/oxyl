const Discord = require("discord.js"),
	fs = require("fs"),
	yaml = require("js-yaml"),
	Oxyl = require("../oxyl.js"),
	framework = require("../framework.js");
const bot = Oxyl.bot;

exports.getPath = (guild) => `../server-configs/${guild.id}.yml`;

exports.getConfig = (guild) => {
	var path = exports.getPath(guild);
	return yaml.safeLoad(fs.readFileSync(path));
};

exports.getValues = (guild) => {
	var data = exports.getConfig(guild);
};

bot.on("guildCreate", (guild) => {
	var path = exports.getPath(guild);
	fs.writeFileSync(path, framework.defaultConfig);
	framework.consoleLog(`Created YML guild config file for ${guild} (\`${path}\`)`, "debug");
});

bot.on("guildDelete", (guild) => {
	var path = exports.getPath(guild);
	try {
		fs.unlinkSync(path);
	} catch(err) {
		return;
	}
	framework.consoleLog(`Deleted YML guild config file for ${guild} (\`${path}\`)`, "debug");
});
