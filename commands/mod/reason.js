const Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js");

var command = new Command("reason", async (message, bot) => {
	let resp = await Oxyl.modScripts.modLog.setReason(message.channel.guild, message.args[0], message.args[1], message.author);

	if(resp === "SUCCESS") return `:white_check_mark: Set reason for case \`${message.args[0]}\``;
	else if(resp === "NO_CASE") return `Case \`${message.args[0]}\` not found`;
	else if(resp === "NO_CHANNEL") return `Mod log channel not found`;
	else if(resp === "NO_MSG") return `Message for case \`${message.args[0]}\` not found`;
	else return `Unexpected error`;
}, {
	perm: "banMembers",
	guildOnly: true,
	type: "moderator",
	description: "Set a reason on the mod log",
	args: [{
		type: "int",
		label: "case",
		min: 1
	}, {
		type: "text",
		label: "reason"
	}]
});
