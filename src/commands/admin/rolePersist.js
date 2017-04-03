module.exports = {
	process: async message => {
		let alreadyPersisted = await r.table("rolePersist").filter({
			guildID: message.channel.guild.id,
			roleID: message.args[1].id,
			rule: true
		}).run();

		if(message.args[0] === "add") {
			if(alreadyPersisted[0]) return `Role \`${message.args[1].name}\` is already a persisted role`;

			await r.table("rolePersist").insert({
				guildID: message.channel.guild.id,
				roleID: message.args[1].id,
				rule: true
			}).run();
			return `Role \`${message.args[1].name}\` added to persisted roles`;
		} else if(message.args[0] === "remove") {
			if(!alreadyPersisted[0]) return `Role \`${message.args[1].name}\` is not a persisted role`;

			await r.table("rolePersist").delete(alreadyPersisted.id).run();
			return `Role \`${message.args[1].name}\` deleted from persisted roles`;
		} else {
			return "Invalid sub-command! Please use `rolepersist add/remove <role>`";
		}
	},
	guildOnly: true,
	description: "Edit the roles which users keep when they rejoin the server",
	args: [{
		type: "text",
		label: "add|remove"
	}, { type: "role" }]
};
