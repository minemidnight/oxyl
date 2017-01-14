const Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js");
const commands = Oxyl.commands;

var command = new Command("cmdinfo", async (message, bot) => {
	let cmd = framework.findCommand(message.args[0]);
	if(!cmd) return "Command not found";

	let helpMsg = "", helpInfo = [];
	helpMsg += `Info on ${message.args[0]}\n`;
	helpMsg += `Command: ${cmd.name}`;
	helpInfo.push(`Command Type: ${framework.capitalizeEveryFirst(cmd.type)}`);

	if(cmd.aliases.length > 0) helpInfo.push(`Aliases: ${cmd.aliases.join(", ")}`);
	else helpInfo.push(`Aliases: N/A`);

	if(cmd.description) helpInfo.push(`Description: ${cmd.description}`);
	else helpInfo.push(`Description: N/A`);

	helpInfo.push(`Usage: ${cmd.usage}`);
	helpInfo.push(`Uses since startup: ${cmd.uses}`);
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
