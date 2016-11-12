const Discord = require("discord.js"),
	Oxyl = require("../../oxyl.js"),
	framework = require("../../framework.js");
const commands = framework.commands;

Oxyl.registerCommand("advancedhelp", "default", (message, bot) => {
	var helpMsg = "";

	for(var cmdType in commands) {
		helpMsg += `newmsg\n\n**~~——————~~** __${cmdType.toUpperCase()} COMMANDS__ **~~——————~~**`;
		for(var loopCmd in commands[cmdType]) {
			let cmdInfo = [];
			helpMsg += `\nCommand: ${loopCmd}`;
			if(commands[cmdType][loopCmd].aliases.length > 0) {
				cmdInfo.push(`Aliases: ${commands[cmdType][loopCmd].aliases.join(", ")}`);
			} else {
				cmdInfo.push(`Aliases: N/A`);
			} if(commands[cmdType][loopCmd].description) {
				cmdInfo.push(`Description: ${commands[cmdType][loopCmd].description}`);
			} else {
				cmdInfo.push(`Description: N/A`);
			} if(commands[cmdType][loopCmd].usage) {
				cmdInfo.push(`Usage: ${commands[cmdType][loopCmd].usage}`);
			} else {
				cmdInfo.push(`Usage: N/A`);
			}
			helpMsg += framework.listConstructor(cmdInfo);
		}
	}
	message.author.sendMessage(`${"**Advanced Help**\n\n" +
  "Command Prefix/Suffix (Works as either, but not both) - `:`\n"}${
  helpMsg}`, { split: true });
	return "messaging you Oxyl's Advanced Help!";
}, [], "List advanced information about every registered command", "[]");
