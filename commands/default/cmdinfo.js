const Discord = require("discord.js"),
	Oxyl = require("./../oxyl.js");

Oxyl.registerCommand("cmdinfo", "default", (message, bot) => {
	var helpInfo = "", cmd = message.content.split(" ")[0], realCmd, cmdType, commands = Oxyl.commands;
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
		helpInfo += `info on ${cmd}` +
                `\nCommand: ${realCmd}` +
                `\n **╠** Command Type: ${cmdType}`;
		if(commands[cmdType][realCmd].aliases.length > 0) {
			helpInfo += `\n **╠** Aliases: ${commands[cmdType][realCmd].aliases.join(", ")}`;
		} else {
			helpInfo += "\n **╠** Aliases: N/A";
		}
		if(commands[cmdType][realCmd].description) {
			helpInfo += `\n **╠** Description: ${commands[cmdType][realCmd].description}`;
		} else {
			helpInfo += "\n **╠** Description: N/A";
		}
		if(commands[cmdType][realCmd].usage) {
			helpInfo += `\n **╚** Usage: ${commands[cmdType][realCmd].usage}`;
		} else {
			helpInfo += "\n **╚** Usage: N/A";
		}
	} else {
		helpInfo = `Command not found - \`${cmd}\``;
		helpInfo = `Command not found - \`${cmd}\``;
	}
	return helpInfo;
}, [], "List detailed information about a command", "<command>");
