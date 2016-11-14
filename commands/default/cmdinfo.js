const Discord = require("discord.js"),
	Oxyl = require("../../oxyl.js"),
	framework = require("../../framework.js");
const commands = framework.commands;

Oxyl.registerCommand("cmdinfo", "default", (message, bot) => {
	var helpMsg = "", cmd = message.content.toLowerCase().split(" ")[0];
	let realCmd, cmdType, helpInfo = [];
	if(!cmd) { return "Please provide a command to get the information of."; }
	for(var typeOf in commands) {
		for(var loopCmd in commands[typeOf]) {
			if(loopCmd === cmd || commands[typeOf][loopCmd].aliases.includes(cmd)) {
				realCmd = loopCmd;
				cmdType = typeOf;
				break;
			}
		}
	}

	if(realCmd) {
		helpMsg += `info on ${cmd}\nCommand: ${realCmd}`;
		helpInfo.push(`Command Type: ${framework.capitalizeEveryFirst(cmdType)}`);

		if(commands[cmdType][realCmd].aliases.length > 0) {
			helpInfo.push(`Aliases: ${commands[cmdType][realCmd].aliases.join(", ")}`);
		} else {
			helpInfo.push(`Aliases: N/A`);
		}

		if(commands[cmdType][realCmd].description) {
			helpInfo.push(`Description: ${commands[cmdType][realCmd].description}`);
		} else {
			helpInfo.push(`Description: N/A`);
		}

		if(commands[cmdType][realCmd].usage) {
			helpInfo.push(`Usage: ${commands[cmdType][realCmd].usage}`);
		} else {
			helpInfo.push(`Usage: N/A`);
		}
		helpInfo = framework.listConstructor(helpInfo);
		helpMsg += helpInfo;
	} else {
		helpMsg = `Command not found - \`${cmd}\``;
	}
	return helpMsg;
}, [], "List detailed information about a command", "<command>");
