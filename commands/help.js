const Discord = require("discord.js"),
	Oxyl = require("../oxyl.js");

Oxyl.registerCommand("help", "default", (message, bot) => {
	var commands = Oxyl.commands;
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

	for(var toSort in cmds) { cmds[toSort].sort(); }

	var defaultcmds = Object.keys(cmds.default).length;
	var modcmds = Object.keys(cmds.moderator).length;
	var creatorcmds = Object.keys(cmds.creator).length;
	var dmcmds = Object.keys(cmds.dm).length;

	return `__Default Commands **(${defaultcmds}):**__ \`${cmds.default.join("`**,** `")
  }\`\n__Moderator Commands **(${modcmds}):**__ \`${cmds.moderator.join("`**,** `")
  }\`\n__Creator Commands **(${creatorcmds}):**__ \`${cmds.creator.join("`**,** `")
  }\`\n__DM Commands **(${dmcmds}):**__ \`${cmds.dm.join("`**,** `")
  }\`\nAll Commands - **${defaultcmds + modcmds + creatorcmds + dmcmds}**` +
  `\nUse \`advancedhelp\` to get a advanced list of commands, or cmdinfo for a detailed description of one.`;
}, ["cmds", "commandlist", "commands"], "List all registered commands", "[]");
