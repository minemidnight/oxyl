module.exports = {
	process: async message => {
		let updatesRole = bot.publicConfig.updatesRole,
			updatesGuild = bot.publicConfig.updatesGuild,
			updatesChannel = bot.publicConfig.channels.updates;
		if(!updatesRole) return "An updates role has not been set in the config";
		else if(!updatesGuild) return "A guild id which the updates role belongs to has not been set in the config";
		else if(!updatesChannel) return "A channel id to release the updates in has not been set in the config";

		try {
			await bot.editRole(updatesGuild, updatesRole, { mentionable: true });
			await bot.createMessage(updatesChannel, `<@&${updatesRole}>\n${message.args[0]}`);
			await bot.editRole(updatesGuild, updatesRole, { mentionable: false });
			return "Update released";
		} catch(err) {
			return `Error during releasing update: ${err.message}`;
		}
	},
	caseSensitive: true,
	description: "Release an update",
	args: [{
		type: "text",
		label: "update"
	}]
};
