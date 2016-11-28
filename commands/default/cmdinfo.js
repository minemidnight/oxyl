const Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js");
const commands = Oxyl.commands;

var command = new Command("cmdinfo", (message, bot) => {
	if(!message.content) {
		return "please provide a command to get the information of";
	} else {
		var cmd = framework.findCommand(message.content);
		if(!cmd) return "command not found";
	}

	let helpMsg = "", helpInfo = [];
	helpMsg += `info on ${message.content}\n`;
	helpMsg += `Command: ${cmd.name}`;
	helpInfo.push(`Command Type: ${framework.capitalizeEveryFirst(cmd.type)}`);

	if(cmd.aliases.length > 0) {
		helpInfo.push(`Aliases: ${cmd.aliases.join(", ")}`);
	} else {
		helpInfo.push(`Aliases: N/A`);
	}

	if(cmd.description) {
		helpInfo.push(`Description: ${cmd.description}`);
	} else {
		helpInfo.push(`Description: N/A`);
	}

	helpInfo.push(`Usage: ${cmd.usage}`);
	helpInfo.push(`Uses (resets on restart): ${cmd.uses}`);
	helpMsg += framework.listConstructor(helpInfo);
	return helpMsg;
}, {
	type: "default",
	description: "List detailed information about a command",
	args: [{
		type: "text",
		label: "command"
	}]
});
