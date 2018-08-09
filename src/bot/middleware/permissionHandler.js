const getNode = require("../modules/getCommandNode");

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
	} else if(settings.blacklistedChannels.includes(channel.id)) {
		return false;
	} else if(settings.roleType === "whitelist" && !settings.roles.includes(guild.id) &&
		!member.roles.some(roleID => settings.roles.includes(roleID))) {
		return false;
	} else if(settings.roleType === "blacklist" && member.roles.some(roleID => settings.roles.includes(roleID))) {
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
