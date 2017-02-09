exports.cmd = new Oxyl.Command("update", async message => {
	let guild = bot.guilds.get("254768930223161344");
	let role = guild.roles.get("265293123821895680");

	await role.edit({ mentionable: true });
	await bot.createMessage(framework.config.channels.updates, `${role.mention}\n${message.argsPreserved[0]}`);
	await role.edit({ mentionable: false });
	return ":white_check_mark: Released update";
}, {
	type: "creator",
	description: "Release an update",
	args: [{
		type: "text",
		label: "update"
	}]
});
