module.exports = async ({ author, channel, command, guild, member, t }, next, wiggle) => {
	if(!command || !guild) return next();

	if(command.perm && !member.permission.has(command.perm)) {
		return channel.createMessage(t("errors.noCommandPermission", {
			permission: command.perm
				.replace(/^.|[A-Z]/g, match => ` ${match.toUpperCase()}`)
				.trim()
		}));
	}

	return next();
};
