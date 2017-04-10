module.exports = {
	process: async message => {
		if(message.args[0] === "list") {
			let roleList = await r.table("roleMe").filter({ guildID: message.channel.guild.id }).run();
			if(roleList.length === 0) return "There are currently no available roles";

			let roles = roleList
				.filter(data => message.channel.guild.roles.has(data.roleID))
				.map(data => message.channel.guild.roles.get(data.roleID).name);
			return `List of available roles: \`${roles.join("`, `")}\``;
		} else if(message.args[0].startsWith("add ")) {
			if(!(message.member.permission.has("administrator") || message.author.id === message.channel.guild.ownerID)) {
				return "You do not have correct permission to add roleme's, " +
					"you must have the permission ADMINISTRATOR or be the server owner";
			}

			let role;
			try {
				role = bot.utils.resolver.role(message, message.args[0].substring(4));
			} catch(err) {
				return err.message;
			}

			let roleAvailable = (await r.table("roleMe").filter({
				guildID: message.channel.guild.id,
				roleID: role.id
			}).run())[0];
			if(roleAvailable) return "That role is already available";

			await r.table("roleMe").insert({
				guildID: message.channel.guild.id,
				roleID: role.id
			});
			return `Added \`${role.name}\` to available roles`;
		} else if(message.args[0].startsWith("remove ")) {
			if(!(message.member.permission.has("administrator") || message.author.id === message.channel.guild.ownerID)) {
				return "You do not have correct permission to add roleme's, " +
					"you must have the permission ADMINISTRATOR or be the server owner";
			}

			let role;
			try {
				role = bot.utils.resolver.role(message, message.args[0].substring(7));
			} catch(err) {
				return err.message;
			}

			let roleAvailable = (await r.table("roleMe").filter({
				guildID: message.channel.guild.id,
				roleID: role.id
			}).run())[0];
			if(!roleAvailable) return "That role is not available";

			await r.table("roleMe").get(roleAvailable.id).delete().run();
			return `Removed \`${role.name}\` from available roles`;
		} else {
			let role;
			try {
				role = bot.utils.resolver.role(message, message.args[0]);
			} catch(err) {
				return err.message;
			}

			let roleAvailable = (await r.table("roleMe").filter({
				guildID: message.channel.guild.id,
				roleID: role.id
			}).run())[0];

			if(!roleAvailable) {
				return "That role is not available";
			} else if(!bot.utils.canAddRole(message.channel.guild, role)) {
				return "Either I do not have permissions, or the muted role's position is higher than mine!";
			} else {
				let hasRole = ~message.member.roles.indexOf(role.id);
				if(hasRole) {
					await message.member.addRole(role.id);
					return `Gave you \`${role.name}\``;
				} else {
					await message.member.removeRole(role.id);
					return `Removed \`${role.name}\` from you`;
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
