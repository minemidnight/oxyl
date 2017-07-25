module.exports = {
	process: async message => {
		if(message.args[0] === "list") {
			let roleList = await r.table("roleMe").getAll(message.channel.guild.id, { index: "guildID" }).run();
			if(roleList.length === 0) return __("commands.default.roleMe.list.noneAvailable", message);

			let roles = roleList
				.filter(data => message.channel.guild.roles.has(data.roleID))
				.map(data => message.channel.guild.roles.get(data.roleID).name);
			return __("commands.default.roleMe.list.success", message, { roles: `\`${roles.join("`, `")}\`` });
		} else if(message.args[0].startsWith("add ")) {
			if(!(message.member.permission.has("administrator") || message.author.id === message.channel.guild.ownerID)) {
				return __("commands.default.roleMe.noPerms", message);
			}

			let role;
			try {
				role = bot.utils.resolver.role(message, message.args[0].substring(4));
			} catch(err) {
				return err.message;
			}

			let roleAvailable = await r.table("roleMe").get(role.id).run();
			if(roleAvailable) return __("commands.default.roleMe.add.alreadyAvailable", message);

			await r.table("roleMe").insert({
				guildID: message.channel.guild.id,
				roleID: role.id
			}).run();
			return __("commands.default.roleMe.add.success", message, { role: role.name });
		} else if(message.args[0].startsWith("remove ")) {
			if(!(message.member.permission.has("administrator") || message.author.id === message.channel.guild.ownerID)) {
				return __("commands.default.roleMe.noPerms", message);
			}

			let role;
			try {
				role = bot.utils.resolver.role(message, message.args[0].substring(7));
			} catch(err) {
				return err.message;
			}

			let roleAvailable = await r.table("roleMe").get(role.id).run();
			if(!roleAvailable) return __("commands.default.roleMe.notAvailable", message);

			await r.table("roleMe").get(role.id).delete().run();
			return __("commands.default.roleMe.remove.success", message, { role: role.name });
		} else {
			let role;
			try {
				role = bot.utils.resolver.role(message, message.args[0]);
			} catch(err) {
				return err.message;
			}

			let roleAvailable = await r.table("roleMe").get(role.id).run();
			if(!roleAvailable) {
				return __("commands.default.roleMe.notAvailable", message);
			} else if(!role.addable) {
				return __("commands.default.roleMe.invalidBotPerms", message);
			} else {
				let hasRole = ~message.member.roles.indexOf(role.id);
				if(hasRole) {
					await message.member.removeRole(role.id, "RoleMe command");
					return __("commands.default.roleMe.removedRole", message, { role: role.name });
				} else {
					await message.member.addRole(role.id, "RoleMe command");
					return __("commands.default.roleMe.gaveRole", message, { role: role.name });
				}
			}
		}
	},
	guildOnly: true,
	description: "Recieve a role or edit roles that are recievable",
	args: [{
		type: "text",
		label: "<role>|list|add/remove <role>"
	}]
};
