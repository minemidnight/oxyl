const sqlQueries = Oxyl.modScripts.sqlQueries;
exports.cmd = new Oxyl.Command("editcommand", async message => {
	let cmd = framework.findCommand(message.args[0]);
	if(!cmd) return "Command not found";
	else if(cmd.name === "editcommand") return "You cannot edit this command";
	else if(cmd.type === "creator") return "no u";
	if(message.args[1] === "reset") {
		await sqlQueries.editCommands.reset(cmd.name, message.channel.guild);
		return `Reset command \`${cmd.name}\``;
	} else if(message.args[1] === "toggle") {
		let res = await sqlQueries.editCommands.edit(cmd.name, "toggle", message.channel.guild);
		return `\`${cmd.name}\` is now ${res ? "enabled" : "disabled"}`;
	} else if(message.args[1] === "roles") {
		if(!message.args[2]) return "Please provide some roles to require! Split each with a ,";
		let roles = message.args[2].split(",").map(value => {
			if(value.match(/<@&(\d{17,21})>/)) value = value.match(/<@&(\d{17,21})>/)[1];
			let foundRole = message.channel.guild.roles.find(role => {
				if(value === role.id || value.toLowerCase() === role.name.toLowerCase()) {
					return true;
				} else {
					return false;
				}
			});

			return foundRole.id || undefined;
		}).filter(role => role !== undefined);
		if(!roles || roles.length === 0) return "Invalid roles given, please provide role names split with a ,";

		await sqlQueries.editCommands.edit(cmd.name, roles, message.channel.guild);
		return `Added roles (${roles.join(", ")}) to \`${cmd.name}\``;
	} else {
		return "Invalid sub-command!";
	}
}, {
	guildOnly: true,
	type: "admin",
	description: "Edit a command by toggling it or requiring roles",
	args: [{
		type: "text",
		label: "command name"
	}, {
		type: "text",
		label: "reset|toggle|roles"
	}, {
		type: "text",
		label: "roles (split with ,)",
		optional: true
	}]
});
