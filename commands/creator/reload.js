const Discord = require("discord.js"),
	Oxyl = require("../../oxyl.js"),
	fs = require("fs");
const loadScript = Oxyl.loadScript;

Oxyl.registerCommand("reload", "creator", (message, bot) => {
	message.content = message.content.toLowerCase();
	var args = message.content.split(" ");
	if(!args[0]) {
		return "please provide a module or command to reload";
	} else {
		var reload, path;
		if(!reload) {
			var commands = fs.readdirSync("./commands/");
			reload = commands.find(cmd => cmd === `${args[0]}.js`);
			path = "./commands/";
		} if(!reload) {
			var modules = fs.readdirSync("./modules/");
			reload = modules.find(module => module === `${args[0]}.js`);
			path = "./modules/";
		}

		if(!reload) {
			return `invalid file: ${args[0]}`;
		} else {
			loadScript(path + reload, true);
			return `reloaded script \`${reload}\` **(**${path}${reload}**)**`;
		}
	}
}, [], "Reload commands or modules", "<command/module name>");
