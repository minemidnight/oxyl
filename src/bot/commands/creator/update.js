module.exports = {
	process: async message => {
		let updateInfo = bot.config.bot.updates;
		if(bot.config.beta) return "This is the beta bot!";
		else if(!updateInfo) return "No update object was set in the config";
		else if(!updateInfo.channel) return "A channel id to release the updates in has not been set in the config";
		else if(!updateInfo.guild) return "A guild id which the updates role belongs to has not been set in the config";
		else if(!updateInfo.role) return "An updates role has not been set in the config";

		try {
			await bot.editRole(updateInfo.guild, updateInfo.role, { mentionable: true });
			await bot.createMessage(updateInfo.channel,
				`<@&${updateInfo.role}>\n${bot.utils.codeBlock(message.args[0], "diff")}`);
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
