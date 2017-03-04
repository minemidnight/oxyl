const sqlQueries = Oxyl.modScripts.sqlQueries;
module.exports = async (guild, member) => {
	let roles = await sqlQueries.roleSetters.get(guild, "auto");
	roles = roles
		.filter(data => guild.roles.has(data.ROLE))
		.map(data => data.ROLE);
	if(!roles || roles.length === 0) return;

	try {
		await member.edit({ roles });
	} catch(err) {
		return;
	}
};

function parseRole(guild, value) {
	if(value.match(/<@&(\d{17,21})>/)) value = value.match(/<@&(\d{17,21})>/)[1];
	let roles = guild.roles;
	let foundRole = roles.find(role => {
		if(value === role.id || value.toLowerCase() === role.name.toLowerCase()) {
			return true;
		} else {
			return false;
		}
	});

	return foundRole || null;
}

async function handleRole(message, args) {
	if(args[0].toLowerCase() === "list") {
		let roles = await sqlQueries.roleSetters.get(message.channel.guild, "auto");
		roles = roles
			.filter(data => message.channel.guild.roles.has(data.ROLE))
			.map(data => message.channel.guild.roles.get(data.ROLE).name);

		return `Autoroles: ${roles.length >= 1 ? roles.join(", ") : "None"}`;
	} else if(args[0].toLowerCase() === "add") {
		let guildLevel = framework.guildLevel(message.member);
		if(guildLevel < 3) return "You need the \`ADMINISTRATOR\` permission, or you must be the guild owner to do this.";

		let role = parseRole(message.channel.guild, args.splice(1).join(" "));
		if(!role) return "Invalid role! Role not found.";

		let exists = await sqlQueries.roleSetters.get(message.channel.guild, "auto", role);
		if(exists) return `\`${role.name}\` is already autorole`;

		sqlQueries.roleSetters.add(message.channel.guild, "auto", role);
		return `Added role \`${role.name}\` to autoroles`;
	} else if(args[0].toLowerCase() === "delete") {
		let guildLevel = framework.guildLevel(message.member);
		if(guildLevel < 3) return "You need the \`ADMINISTRATOR\` permission, or you must be the guild owner to do this.";

		let role = parseRole(message.channel.guild, args.splice(1).join(" "));
		if(!role) return "Invalid role! Role not found.";

		let exists = await sqlQueries.roleSetters.get(message.channel.guild, "auto", role);
		if(!exists) return `\`${role.name}\` is not autorole`;

		sqlQueries.roleSetters.delete(message.channel.guild, "auto", role);
		return `Removed role \`${role.name}\` from autoroles`;
	} else {
		let normal = ["autorole list - list autoroles"];
		let admin = [
			"autorole add <role name> - add a role to autoroles",
			"autorole delete <role name> - remove a role from autoroles"
		];

		return `Normal Users: ${framework.listConstructor(normal)}` +
					`\nAdmins: ${framework.listConstructor(admin)}`;
	}
}

exports.cmd = new Oxyl.Command("autorole", async message => {
	let args = message.argsPreserved[0].split(" ");
	return await handleRole(message, args);
}, {
	cooldown: 2500,
	guildOnly: true,
	type: "default",
	description: "Edit autoroles, or list them",
	args: [{
		type: "text",
		label: "help|list|add <role name>|delete <role name>",
		optional: true
	}]
});
