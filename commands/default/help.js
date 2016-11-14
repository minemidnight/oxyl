const Discord = require("discord.js"),
	Oxyl = require("../../oxyl.js"),
	framework = require("../../framework.js");
const commands = framework.commands;

Oxyl.registerCommand("help", "default", (message, bot) => {
	var cmds = {};

	for(var cmdType in commands) {
		cmds[cmdType] = [];
		for(var loopCmd in commands[cmdType]) {
			cmds[cmdType].push(loopCmd);
			var aliases = commands[cmdType][loopCmd].aliases;
			for(var i = 0; i < aliases.length; i++) {
				var alias = aliases[i];
				cmds[cmdType].push(alias);
			}
		}
	}

	var helpMsg = "", totalAmt = 0;

	for(var loopType in cmds) {
		cmds[loopType] = cmds[loopType].sort();
		var length = Object.keys(cmds[loopType]).length;
		totalAmt += length;
		helpMsg += `${framework.capitalizeEveryFirst(loopType)} Commands **(${length}):** `;
		helpMsg += `\`${cmds[loopType].join("`**,** `")}\`\n\n`;
	}

	helpMsg += `All Commands - **${totalAmt}**`;
	helpMsg += `\nUse \`advancedhelp\` to get a advanced list of commands, or \`cmdinfo\` to get a detailed description of one`;

	return helpMsg;
}, ["cmds", "commandlist", "commands"], "List all registered commands", "[]");
