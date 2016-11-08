const Discord = require("discord.js"),
	fs = require("fs"),
	Oxyl = require("../oxyl.js");

Oxyl.bot.on("guildCreate", (guild) => {
	var path = `../server-configs/${guild.id}.yml`;
	fs.writeFileSync(path, Oxyl.defaultConfig);
	Oxyl.consoleLog(`Created YML guild config file for ${guild} (\`${path}\`)`, "debug");
	guild.owner.sendMessage(`Thank you for adding Oxyl to your guild **(**${guild}**)**.\n\n` +
		"Oxyl will be using the default configuration values. For more info, or to customize" +
		`configuration options, run \`:config ${guild.id}\` or \`config: ${guild.id}\``);
});

Oxyl.bot.on("guildDelete", (guild) => {
	var path = `../server-configs/${guild.id}.yml`;
	try {
		fs.unlinkSync(path);
	} catch(err) {
		return;
	}
	Oxyl.consoleLog(`Deleted YML guild config file for ${guild} (\`${path}\`)`, "debug");
});
