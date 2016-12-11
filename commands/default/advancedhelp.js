const Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js");
const commands = Oxyl.commands;

var command = new Command("advancedhelp", (message, bot) => {
	let helpMsg = "**Advanced Help**\nPrefix: @oxyl or oxyl";

	for(let cmdType in commands) {
		helpMsg += `\n\n**~~——————~~** __${cmdType.toUpperCase()} COMMANDS__ **~~——————~~**`;
		for(let cmd in commands[cmdType]) {
			cmd = commands[cmdType][cmd];
			let cmdInfo = [];
			helpMsg += `\nCommand: ${cmd.name}`;

			if(cmd.aliases.length > 0) {
				cmdInfo.push(`Aliases: ${cmd.aliases.join(", ")}`);
			} else {
				cmdInfo.push(`Aliases: N/A`);
			}

			if(cmd.description) {
				cmdInfo.push(`Description: ${cmd.description}`);
			} else {
				cmdInfo.push(`Description: N/A`);
			}

			cmdInfo.push(`Usage: ${cmd.usage}`);
			cmdInfo.push(`Uses (resets on restart): ${cmd.uses}`);
			helpMsg += framework.listConstructor(cmdInfo);
		}
	}

	message.author.sendMessage(helpMsg, { split: true });
	return "Messaging you Oxyl's Advanced Help!";
}, {
	type: "default",
	description: "List advanced information about every registered command"
});
