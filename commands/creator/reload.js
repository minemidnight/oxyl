const Oxyl = require("../../oxyl.js"),
	framework = require("../../framework.js"),
	Command = require("../../modules/commandCreator.js"),
	fs = require("fs");
const loadScript = framework.loadScript;

var command = new Command("reload", (message, bot) => {
	message.content = message.content.toLowerCase();
	var reload = framework.findFile(["./commands/", "./modules/", "./site/"], message.args[0], "js");

	if(!reload) {
		return `Invalid file: ${message.args[0]}`;
	} else {
		loadScript(reload[0] + reload[1], true);
		return `Reloaded script \`${reload[1]}\` **(**${reload[0]}${reload[1]}**)**`;
	}
}, {
	type: "creator",
	description: "Reload commands or modules",
	args: [{
		type: "text",
		label: "command/module name"
	}]
});
