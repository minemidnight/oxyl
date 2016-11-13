const Discord = require("discord.js"),
	Oxyl = require("../../oxyl.js"),
	framework = require("../../framework.js"),
	path = require("path"),
	fs = require("fs");
const loadScript = framework.loadScript;

Oxyl.registerCommand("reload", "creator", (message, bot) => {
	message.content = message.content.toLowerCase();
	var args = message.content.split(" ");
	if(!args[0]) {
		return "please provide a module or command to reload";
	} else {
		var reload = framework.findFile(["./commands/", "./modules/"], args[0], "js");

		if(!reload) {
			return `invalid file: ${args[0]}`;
		} else {
			let script = path.resolve(reload[0] + reload[1]);
			delete require.cache[require.resolve(script)];
			loadScript(reload[0] + reload[1], true);
			return `reloaded script \`${reload[1]}\` **(**${reload[0]}${reload[1]}**)**`;
		}
	}
}, [], "Reload commands or modules", "<command/module name>");
