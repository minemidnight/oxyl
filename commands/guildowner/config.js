const Discord = require("discord.js"),
	yaml = require("js-yaml"),
	fs = require("fs"),
	Oxyl = require("../../oxyl.js"),
	framework = require("../../framework.js"),
	configs = require("../../modules/serverconfigs.js");
const changeConfig = framework.changeConfig;

function handleGet(message, args) {
	if(!args[1]) {
		return `you must provide what value to get! (\`values\` or <value>)`;
	} else if(args[1] === "values") {
		return configs.getValues(message.guild);
	}
}

Oxyl.registerCommand("config", "guild owner", (message, bot) => {
	var args = message.content.split(" ");
	if(args.length === 0) {
		return `please provide a parameter (\`get\` or \`set\`)`;
	} else if(args[0] === "get") {
		return handleGet(message, args);
	}
}, [], "Configurate Oxyl and his settings per guild", "<get/set> [options]");
