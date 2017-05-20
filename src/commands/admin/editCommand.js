module.exports = {
	process: async message => {
		let command = Object.keys(bot.commands)
			.map(key => bot.commands[key])
			.find(cmd => message.args[0] === cmd.name || ~cmd.aliases.indexOf(message.args[0]));
		if(!command) {
			return __("commands.admin.editCommand.commandNotFound", message);
		} else if(command.name === "editcommand" || command.type === "creator") {
			__("commands.admin.editCommand.cantEdit", message);
		}

		if(message.args[1] === "info") {
			let editedInfo = (await r.table("editedCommands").filter({
				command: command.name,
				guildID: message.channel.guild.id
			}))[0];

			if(!editedInfo) {
				return __("commands.admin.editCommand.info.noEdits", message);
			} else {
				let roleNames = editedInfo.roles.map(roleID => message.channel.guild.roles.has(roleID) ?
					message.channel.guild.roles.get(roleID).name : roleID);

				return __("commands.admin.editCommand.success", message, {
					command: command.name,
					enabled: editedInfo.enabled,
					roles: editedInfo.roles.length === 0 ? __("phrases.noneRequired", message) : `\`${roleNames.join("`, `")}\``
				});
			}
		} else if(message.args[1] === "reset") {
			await r.table("editedCommands").filter({
				command: command.name,
				guildID: message.channel.guild.id
			}).delete().run();
			return __("commands.admin.editCommand.reset.success", message, { command: command.name });
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

				return __("commands.admin.editCommand.toggle.disabled", message, { command: command.name });
			} else {
				await r.table("editedCommands").get(editedInfo.id).update({ enabled: !editedInfo.enabled });

				return __(`commands.admin.editCommand.toggle.${!editedInfo.enabled ? "en" : "dis"}abled`,
					message, { command: command.name });
			}
		} else if(message.args[1] === "roles") {
			if(!message.args[2]) return __("commands.admin.editCommand.roles.noArg", message);

			let roles;
			try {
				roles = message.args[2].split(",").map(input => bot.utils.resolver.role(message, input));
			} catch(err) {
				return __("commands.admin.editCommand.roles.invalidRoles", message);
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

			return __("commands.admin.editCommand.roles.success", message, {
				command: command.name,
				roles: `\`${roles.map(role => role.name).join("`, `")}\``
			});
		} else {
			return __("commands.admin.editCommand.invalidSubCommand", message);
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
