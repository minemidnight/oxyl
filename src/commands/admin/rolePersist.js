module.exports = {
	process: async message => {
		let filterData = { guildID: message.channel.guild.id, rule: true };
		if(message.args[1]) filterData.roleID = message.args[1].id;
		let roleData = await r.table("rolePersist").filter(filterData).run();

		if(message.args[0] === "add") {
			if(!message.args[1]) return "Please provide a role to add to the persisted roles!";
			else if(roleData[0]) return `Role \`${message.args[1].name}\` is already a persisted role`;

			await r.table("rolePersist").insert({
				guildID: message.channel.guild.id,
				roleID: message.args[1].id,
				rule: true
			}).run();
			return `Role \`${message.args[1].name}\` added to persisted roles`;
		} else if(message.args[0] === "remove") {
			if(!message.args[1]) return "Please provide a role to remove from the persisted roles!";
			else if(!roleData[0]) return `Role \`${message.args[1].name}\` is not a persisted role`;

			await r.table("rolePersist").get(roleData.id).delete().run();
			return `Role \`${message.args[1].name}\` deleted from persisted roles`;
		} else if(message.args[0] === "list") {
			if(roleData.length === 0) return "There are currently no persisted roles";

			let roles = roleData
				.filter(data => message.channel.guild.roles.has(data.roleID))
				.map(data => message.channel.guild.roles.get(data.roleID).name);
			return `List of persisted roles: \`${roles.join("`, `")}\``;
		} else {
			return "Invalid sub-command! Please use `rolepersist <add|remove|list> [<role>]`";
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
