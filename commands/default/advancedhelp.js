const commands = Oxyl.commands;

exports.cmd = new Oxyl.Command("advancedhelp", async message => {
	let helpMsg = "**Advanced Help**\nPrefix: @oxyl or oxyl";

	for(let cmdType in commands) {
		helpMsg += `\n\n**~~——————~~** __${cmdType.toUpperCase()} COMMANDS__ **~~——————~~**`;
		for(let cmd in commands[cmdType]) {
			cmd = commands[cmdType][cmd];
			let cmdInfo = [];
			helpMsg += `\nCommand: ${cmd.name}`;
			if(cmd.aliases.length > 0) cmdInfo.push(`Aliases: ${cmd.aliases.join(", ")}`);
			if(cmd.description) cmdInfo.push(`Description: ${cmd.description}`);
			if(cmd.usage !== "[]") cmdInfo.push(`Usage: ${cmd.usage}`);
			helpMsg += framework.listConstructor(cmdInfo);
		}
	}

	let dm = await message.author.getDMChannel();
	framework.splitParts(helpMsg).forEach(msg => dm.createMessage(msg));
	return "Messaging you Oxyl's Advanced Help!";
}, {
	type: "default",
	description: "List advanced information about every registered command"
});
