module.exports = {
	process: async message => {
		let filterData = { guildID: message.channel.guild.id };
		if(message.args[1]) filterData.roleID = message.args[1].id;
		let roleData = await r.table("autoRole").filter(filterData).run();

		if(message.args[0] === "add") {
			if(!message.args[1]) return "Please provide a role to add to the autoroles!";
			else if(roleData[0]) return `Role \`${message.args[1].name}\` is already an autorole`;

			await r.table("autoRole").insert({
				guildID: message.channel.guild.id,
				roleID: message.args[1].id
			}).run();
			return `Role \`${message.args[1].name}\` added to autoroles`;
		} else if(message.args[0] === "remove") {
			if(!message.args[1]) return "Please provide a role to remove from the autoroles!";
			else if(!roleData[0]) return `Role \`${message.args[1].name}\` is not an autorole`;

			await r.table("autoRole").get(roleData.id).delete().run();
			return `Role \`${message.args[1].name}\` deleted from autoroles`;
		} else if(message.args[0] === "list") {
			if(roleData.length === 0) return "There are currently no autoroles";

			let roles = roleData
				.filter(data => message.channel.guild.roles.has(data.roleID))
				.map(data => message.channel.guild.roles.get(data.roleID).name);
			return `List of autoroles: \`${roles.join("`, `")}\``;
		} else {
			return "Invalid sub-command! Please use `autorole <add|remove|list> [<role>]`";
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
