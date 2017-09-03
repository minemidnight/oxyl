module.exports = {
	process: async message => {
		if(message.args[0]) {
			let command = Object.keys(bot.commands)
				.map(key => bot.commands[key])
				.find(cmd => message.args[0] === cmd.name || ~cmd.aliases.indexOf(message.args[0]));
			if(!command) return __("commands.default.help.commandNotFound", message);

			let helpMsg = `__**Command Name**__: ${command.name}\n`;
			helpMsg += `Category: ${command.type}\n`;
			helpMsg += `Usage: ${command.usage}\n`;
			helpMsg += `Aliases: ${command.aliases.length ? command.aliases.join(", ") : "None"}\n`;
			helpMsg += `Description: ${command.description || "None provided"}\n`;
			if(command.perm) helpMsg += `Required Permission: ${command.perm}\n`;
			else if(command.guildOnly) helpMsg += `This command will only work in guilds\n`;
			helpMsg += `Uses: ${command.uses}`;

			return __("commands.default.help.commandInfo", message, {
				command: command.name,
				category: command.type,
				usage: command.usage,
				aliases: command.aliases.length ? command.aliases.join(", ") : __("words.none", message, {}, true),
				description: command.description || __("phrases.noneProvided", message),
				perm: command.perm || __("phrases.noneRequired", message)
			});
		} else {
			let disabled;
			if(message.channel.guild) {
				disabled = await r.table("editedCommands")
					.getAll(message.channel.guild.id, { index: "guildID" })
					.filter({ enabled: false }).getField("command").run();
			} else {
				disabled = [];
			}

			let commandMsg = "", commandTypes = {};
			for(let cmd in bot.commands) {
				cmd = bot.commands[cmd];
				if(cmd.type === "creator") continue;
				else if(~disabled.indexOf(cmd.name)) continue;
				else if(!commandTypes[cmd.type]) commandTypes[cmd.type] = [];
				commandTypes[cmd.type].push(cmd.name);
				commandTypes[cmd.type].concat(cmd.aliases);
			}

			for(let category in commandTypes) {
				commandTypes[category].sort();
				commandMsg += `\n__${category.charAt(0).toUpperCase() + category.substring(1)}__\n`;
				commandMsg += commandTypes[category].join(", ");
				commandMsg += `\n`;
			}

			return __("commands.default.help.commandList", message, {
				count: Object.keys(bot.commands).length,
				commands: commandMsg
			});
		}
	},
	description: "List commands, or get info on one",
	args: [{
		type: "text",
		label: "command",
		optional: true
	}]
};
