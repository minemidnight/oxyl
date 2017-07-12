module.exports = {
	process: async message => {
		let filterData = { guildID: message.channel.guild.id, rule: true };
		if(message.args[1]) filterData.roleID = message.args[1].id;
		let roleData = await r.table("rolePersist").filter(filterData).run();

		if(message.args[0] === "add") {
			if(!message.args[1]) {
				return __("commands.admin.rolePersist.add.noArg", message);
			} else if(roleData[0]) {
				return __("commands.admin.rolePersist.add.alreadyPersisted", message, { role: message.args[1].name });
			}

			await r.table("rolePersist").insert({
				guildID: message.channel.guild.id,
				roleID: message.args[1].id,
				rule: true
			}).run();
			return __("commands.admin.rolePersist.add.success", message, { role: message.args[1].name });
		} else if(message.args[0] === "remove") {
			if(!message.args[1]) {
				return __("commands.admin.rolePersist.remove.noArg", message);
			} else if(!roleData[0]) {
				return __("commands.admin.rolePersist.remove.notPersisted", message, { role: message.args[1].name });
			}

			await r.table("rolePersist").get(roleData.id).delete().run();
			return __("commands.admin.rolePersist.remove.success", message, { role: message.args[1].name });
		} else if(message.args[0] === "list") {
			if(roleData.length === 0) return __("commands.admin.rolePersist.list.noPersistedRoles", message);

			let roles = roleData
				.filter(data => message.channel.guild.roles.has(data.roleID))
				.map(data => message.channel.guild.roles.get(data.roleID).name);
			return __("commands.admin.rolePersist.list.success", message, { roles: `\`${roles.join("`, `")}\`` });
		} else {
			return __("commands.admin.rolePersist.invalidSubcommand", message);
		}
	},
	guildOnly: true,
	description: "Edit the roles which users keep when they rejoin the server",
	args: [{
		type: "text",
		label: "add|remove|list"
	}, {
		type: "role",
		optional: true
	}]
};
