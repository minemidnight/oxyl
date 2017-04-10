module.exports = {
	process: async message => {
		if(message.args[0]) {
			let command = Object.keys(bot.commands)
				.map(key => bot.commands[key])
				.find(cmd => message.args[0] === cmd.name || ~cmd.aliases.indexOf(message.args[0]));
			if(!command) return "Command not found";

			let helpMsg = `__**Command Name**__: ${command.name}\n`;
			helpMsg += `Category: ${command.type}\n`;
			helpMsg += `Usage: ${command.usage}\n`;
			helpMsg += `Aliases: ${command.aliases.length ? command.aliases.join(", ") : "None"}\n`;
			helpMsg += `Description: ${command.description || "None provided"}\n`;
			if(command.perm) helpMsg += `Required Permission: ${command.perm}\n`;
			else if(command.guildOnly) helpMsg += `This command will only work in guilds\n`;
			helpMsg += `Uses: ${command.uses}`;
			return helpMsg;
		} else {
			let helpMsg = `**Commands (${Object.keys(bot.commands).length} total)**`;
			let commandTypes = {};
			for(let cmd in bot.commands) {
				cmd = bot.commands[cmd];
				if(!commandTypes[cmd.type]) commandTypes[cmd.type] = [];
				commandTypes[cmd.type].push(cmd.name);
				commandTypes[cmd.type].concat(cmd.aliases);
			}

			for(let category in commandTypes) {
				commandTypes[category].sort();
				helpMsg += `\n__${category.substring(0, 1).toUpperCase() + category.substring(1)}__\n`;
				helpMsg += commandTypes[category].join(", ");
				helpMsg += `\n`;
			}

			helpMsg += `\nUse \`help <command>\` to get more information on a command`;
			return helpMsg;
		}
	},
	description: "List commands, or get info on one",
	args: [{
		type: "text",
		label: "command",
		optional: true
	}]
};
