const Discord = require("discord.js"),
	Oxyl = require("./../oxyl.js");
const commands = Oxyl.commands;

Oxyl.registerCommand("advancedhelp", "default", (message, bot) => {
	var helpMsg = "";

	for(var cmdType in commands) {
		helpMsg += `newmsg\n\n**~~——————~~** __${cmdType.toUpperCase()} COMMANDS__ **~~——————~~**`;
		for(var loopCmd in commands[cmdType]) {
			helpMsg += `\nCommand: ${loopCmd}`;
			if(commands[cmdType][loopCmd].aliases.length > 0) {
				helpMsg += `\n **╠** Aliases: ${commands[cmdType][loopCmd].aliases.join(", ")}`;
			} else {
				helpMsg += "\n **╠** Aliases: N/A";
			} if(commands[cmdType][loopCmd].description) {
				helpMsg += `\n **╠** Description: ${commands[cmdType][loopCmd].description}`;
			} else {
				helpMsg += "\n **╠** Description: N/A";
			} if(commands[cmdType][loopCmd].usage) {
				helpMsg += `\n **╚** Usage: ${commands[cmdType][loopCmd].usage}`;
			} else {
				helpMsg += "\n **╚** Usage: N/A";
			}
		}
	}
	message.author.sendMessage(`${"**Advanced Help**\n\n" +
  "Command Prefix/Suffix (Works as either, but not both) - `:`\n"}${
  helpMsg}`, { split: true });
	return "messaging you Oxyl's Advanced Help!";
}, [], "List advanced information about every registered command", "[]");
