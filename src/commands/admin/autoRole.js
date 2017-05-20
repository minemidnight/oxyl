module.exports = {
	process: async message => {
		let filterData = { guildID: message.channel.guild.id };
		if(message.args[1]) filterData.roleID = message.args[1].id;
		let roleData = await r.table("autoRole").filter(filterData).run();

		if(message.args[0] === "add") {
			if(!message.args[1]) {
				return __("commands.admin.autoRole.add.noArg", message);
			} else if(roleData[0]) {
				return __("commands.admin.autoRole.add.alreadyAutorole", message, { role: message.args[1].name });
			}

			await r.table("autoRole").insert({
				guildID: message.channel.guild.id,
				roleID: message.args[1].id
			}).run();
			return __("commands.admin.autoRole.add.success", message, { role: message.args[1].name });
		} else if(message.args[0] === "remove") {
			if(!message.args[1]) {
				return __("commands.admin.autoRole.remove.noArg", message);
			} else if(roleData[0]) {
				return __("commands.admin.autoRole.remove.notAutorole", message, { role: message.args[1].name });
			}

			await r.table("autoRole").get(roleData.id).delete().run();
			return __("commands.admin.autoRole.remove.success", message, { role: message.args[1].name });
		} else if(message.args[0] === "list") {
			if(roleData.length === 0) return __("commands.admin.autoRole.list.noAutoroles", message);

			let roles = roleData
				.filter(data => message.channel.guild.roles.has(data.roleID))
				.map(data => message.channel.guild.roles.get(data.roleID).name);
			return __("commands.admin.autoRole.list.sucess", message, { roles: `\`${roles.join("`, `")}\`` });
		} else {
			return __("commands.admin.autoRole.invalidSubcommand", message);
		}
	},
	guildOnly: true,
	description: "Set up roles to automatically give to a user when they join",
	args: [{
		type: "text",
		label: "add|remove|list"
	}, {
		type: "role",
		optional: true
	}]
};
