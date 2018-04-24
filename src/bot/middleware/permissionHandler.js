function getNode(command, wiggle) {
	let category = command.category;
	if(!wiggle.categories.has(category)) category = wiggle.categories.find(cat => cat.subcommands.has(category)).name;
	command = command.name;

	let node = `${category}.`;

	if(wiggle.categories.get(category).commands.has(command)) {
		const subcommands = wiggle.categories.get(category).subcommands;
		if(!subcommands) return false;
		if(!subcommands.has(command)) {
			const subcommand = subcommands.find(({ commands }) => commands.has(command));
			if(!subcommand) return false;
			else node += `${subcommand.name}.`;
		}
	}

	node += command;
	return node;
}


module.exports = async ({ author, channel, channel: { guild }, command, member, t }, next, wiggle) => {
	const { r } = wiggle.locals;
	if(!command || !guild) return next();

	const commandNode = getNode(command, wiggle);
	const settings = await r.table("commandSettings")
		.get([guild.id, commandNode])
		.default({
			enabled: true,
			roleType: "whitelist",
			roles: [guild.id],
			blacklistedChannels: []
		})
		.without("id", "guildID")
		.run();

	if(!settings.enabled) {
		return false;
	} else if(~settings.blacklistedChannels.indexOf(channel.id)) {
		return false;
	} else if(settings.roleType === "whitelist" && !~settings.roles.indexOf(guild.id) &&
		!member.roles.some(roleID => ~settings.roles.indexOf(roleID))) {
		return false;
	} else if(settings.roleType === "blacklist" && member.roles.some(roleID => ~settings.roles.indexOf(roleID))) {
		return false;
	} else if(((settings.roleType === "whitelist" &&
		settings.roles.length === 1 &&
		settings.roles[0] === guild.id) ||
		!settings.roles.length) &&
		command.perm &&
		!member.permission.has(command.perm)) {
		return channel.createMessage(t("errors.noCommandPermission", {
			permission: command.perm
				.replace(/^.|[A-Z]/g, match => ` ${match.toUpperCase()}`)
				.trim()
		}));
	}

	return next();
};
