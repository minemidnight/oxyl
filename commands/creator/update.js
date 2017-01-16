const Oxyl = require("../../oxyl.js"),
	framework = require("../../framework.js"),
	Command = require("../../modules/commandCreator.js");

var command = new Command("update", async (message, bot) => {
	let guild = bot.guilds.get("254768930223161344");
	let role = guild.roles.get("265293123821895680");

	await role.edit({ mentionable: true });
	bot.createMessage(framework.config.channels.updates, `<@&${role.id}>\n${message.argsPreserved[0]}`);
	role.edit({ mentionable: false });
	return ":white_check_mark: Released update";
}, {
	type: "creator",
	description: "Release an update",
	args: [{
		type: "text",
		label: "update"
	}]
});
