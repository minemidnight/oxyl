const commands = Oxyl.commands;
exports.cmd = new Oxyl.Command("help", async message => {
	if(message.args[0]) {
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
	} else {
		let cmds = {};

		for(let cmdType in commands) {
			cmds[cmdType] = [];
			for(let cmd in commands[cmdType]) {
				cmd = commands[cmdType][cmd];
				cmds[cmdType].push(cmd.name);
				cmds[cmdType].concat(cmd.aliases);
			}
		}

		let helpMsg = "", totalAmt = 0;

		for(let loopType in cmds) {
			cmds[loopType] = cmds[loopType].sort();
			let length = Object.keys(cmds[loopType]).length;
			totalAmt += length;
			helpMsg += `${framework.capitalizeEveryFirst(loopType)} Commands **(${length}):** `;
			helpMsg += `\`${cmds[loopType].join("`**,** `")}\`\n\n`;
		}

		if(message.channel.guild) {
			let customs = await Oxyl.modScripts.sqlQueries.dbQuery(`SELECT COMMAND FROM CustomCommands WHERE GUILD = "${message.channel.guild.id}"`);
			if(customs && customs.length >= 1) {
				customs = customs.map(cmd => cmd.COMMAND).sort();
				helpMsg += `Custom Commands **(${customs.length}):** `;
				helpMsg += `\`${customs.join("`**,** `")}\`\n\n`;
			}
		}

		helpMsg += `All Commands - **${totalAmt}**`;
		helpMsg += `\nUse \`advancedhelp\` to get a detailed list of commands, or \`help <cmd>\` to get info on one`;

		return helpMsg;
	}
}, {
	type: "default",
	description: "List commands, or get info on a single one",
	args: [{
		type: "text",
		label: "command",
		optional: true
	}]
});
