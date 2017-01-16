const Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js");

function parseRole(guild, value) {
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
	if(!args || !args[0] || args[0].toLowerCase() === "help") {
		let normal = [
			"roleme list - list roles available",
			"roleme <role name> - gives you a role"
		];

		let admin = [
			"roleme add <role name> - add a role to available roles",
			"roleme delete <role name> - remove a role from available roles"
		];

		return `Normal Users: ${framework.listConstructor(normal)}` +
					`\nAdmins: ${framework.listConstructor(admin)}`;
	} else if(args[0].toLowerCase() === "list") {
		let available = await framework.getRoles(message.channel.guild, "me");
		available = available
			.filter(data => message.channel.guild.roles.has(data.ROLE))
			.map(data => message.channel.guild.roles.get(data.ROLE).name);

		return `Available Roles: ${available.length >= 1 ? available.join(",") : "None"}`;
	} else if(args[0].toLowerCase() === "add") {
		let guildLevel = framework.guildLevel(message.member);
		if(guildLevel < 3) return "You need the \`ADMINISTRATOR\` permission, or you must be the guild owner to do this.";

		let role = parseRole(message.channel.guild, args.splice(1).join(" "));
		if(!role) return "Invalid role! Role not found.";

		let exists = await framework.getRole(message.channel.guild, "me", role);
		if(exists) return `\`${role.name}\` is already an available role`;

		framework.addRole(message.channel.guild, "me", role);
		return `Added role \`${role.name}\` to available roles`;
	} else if(args[0].toLowerCase() === "delete") {
		let guildLevel = framework.guildLevel(message.member);
		if(guildLevel < 3) return "You need the \`ADMINISTRATOR\` permission, or you must be the guild owner to do this.";

		let role = parseRole(message.channel.guild, args.splice(1).join(" "));
		if(!role) return "Invalid role! Role not found.";

		let exists = await framework.getRole(message.channel.guild, "me", role);
		if(!exists) return `\`${role.name}\` is not available role`;

		framework.deleteRole(message.channel.guild, "me", role);
		return `Removed role \`${role.name}\` from available roles`;
	} else {
		let role = parseRole(message.channel.guild, args.join(" "));
		if(!role) return "Invalid role! Role not found (view \`roleme list\`).";

		let exists = await framework.getRole(message.channel.guild, "me", role);
		if(!exists) return `\`${role.name}\` is not available role`;

		let hasRole = message.member.roles.indexOf(role.id) > -1;
		if(hasRole) {
			message.member.removeRole(role.id);
			return `:white_check_mark: Removed \`${role.name}\` from you`;
		} else {
			message.member.addRole(role.id);
			return `:white_check_mark: Gave you \`${role.name}\``;
		}
	}
}

var command = new Command("roleme", async (message, bot) => {
	let args = message.argsPreserved[0].split(" ");
	return await handleRole(message, args);
}, {
	cooldown: 2500,
	guildOnly: true,
	type: "default",
	description: "Receive a role, or edit available roles",
	args: [{
		type: "text",
		label: "help|list|<role name>|add <role name>|delete <role name>",
		optional: true
	}]
});
