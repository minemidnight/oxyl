module.exports = {
	process: async message => {
		let updateInfo = bot.publicConfig.updates;
		if(!updateInfo.channel) return "A channel id to release the updates in has not been set in the config";
		else if(!updateInfo.guild) return "A guild id which the updates role belongs to has not been set in the config";
		else if(!updateInfo.role) return "An updates role has not been set in the config";

		try {
			await bot.editRole(updateInfo.guild, updateInfo.role, { mentionable: true });
			await bot.createMessage(updateInfo.channel, `<@&${updateInfo.role}>\n${message.args[0]}`);
			await bot.editRole(updateInfo.guild, updateInfo.role, { mentionable: false });
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
