module.exports = {
	process: async message => {
		let command = Object.keys(bot.commands)
			.map(key => bot.commands[key])
			.find(cmd => message.args[0] === cmd.name || ~cmd.aliases.indexOf(message.args[0]));
		if(!command) return "Command not found";
		else if(command.name === "editcommand" || command.type === "creator") return "You cannot edit this command";

		if(message.args[1] === "info") {
			let editedInfo = (await r.table("editedCommands").filter({
				command: command.name,
				guildID: message.channel.guild.id
			}))[0];

			if(!editedInfo) {
				return "There are no edits to this command";
			} else {
				let roleNames = editedInfo.roles.map(roleID => message.channel.guild.roles.has(roleID) ?
					message.channel.guild.roles.get(roleID).name : roleID);

				let infoMessage = `__**Command**__: ${command.name}\n`;
				infoMessage += `Enabled: ${editedInfo.enabled}\n`;
				infoMessage += `Roles: ${editedInfo.roles.length === 0 ? "None required" : `\`${roleNames.join("`, `")}\``}`;
				return infoMessage;
			}
		} else if(message.args[1] === "reset") {
			await r.table("editedCommands").filter({
				command: command.name,
				guildID: message.channel.guild.id
			}).delete().run();
			return `Reset command \`${command.name}\``;
		} else if(message.args[1] === "toggle") {
			let editedInfo = (await r.table("editedCommands").filter({
				command: command.name,
				guildID: message.channel.guild.id
			}))[0];

			if(!editedInfo) {
				await r.table("editedCommands").insert({
					command: command.name,
					enabled: false,
					guildID: message.channel.guild.id,
					roles: []
				});

				return `Disabled command \`${command.name}\``;
			} else {
				await r.table("editedCommands").get(editedInfo.id).update({ enabled: !editedInfo.enabled });

				return `${!editedInfo.enabled ? "En" : "Dis"}abled command \`${command.name}\``;
			}
		} else if(message.args[1] === "roles") {
			if(!message.args[2]) return "Please provide some roles to require! Split each with a ,";

			let roles;
			try {
				roles = message.args[2].split(",").map(input => bot.utils.resolver.role(message, input));
			} catch(err) {
				return "Invalid roles given, please provide role names split with a ,";
			}

			let editedInfo = (await r.table("editedCommands").filter({
				command: command.name,
				guildID: message.channel.guild.id
			}))[0];

			if(!editedInfo) {
				await r.table("editedCommands").insert({
					command: command.name,
					enabled: true,
					guildID: message.channel.guild.id,
					roles: roles.map(role => role.id)
				});
			} else {
				await r.table("editedCommands").get(editedInfo.id).update({ roles: roles.map(role => role.id) });
			}
			return `Command \`${command.name}\` now requires one of the following roles: ` +
				`\`${roles.map(role => role.name).join("`, `")}\``;
		} else {
			return "Invalid sub-command! Please use the command as such: " +
				"`editcommand <command name> <info|reset|toggle|roles> [<roles (split with ,)>]`";
		}
	},
	description: "Edit a command by toggling it or requiring roles",
	args: [{
		type: "text",
		label: "command name"
	}, {
		type: "text",
		label: "info|reset|toggle|roles"
	}, {
		type: "text",
		label: "roles (split with ,)",
		optional: true
	}]
};
