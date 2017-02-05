const Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js");

var command = new Command("reason", async (message, bot) => {
	if(message.args[0].includes(",")) message.args[0] = message.args[0].split(",");
	else message.args[0] = [message.args[0]];
	message.args[0] = message.args[0].map(int => parseInt(int));
	if(message.args[0].some(int => isNaN(int))) return "Please only provide numbers for cases";

	message.channel.sendTyping();
	let errMsg, casesSet = 0;
	for(let casenum of message.args[0]) {
		if(errMsg) break;
		let resp = await Oxyl.modScripts.modLog.setReason(message.channel.guild, casenum, message.args[1], message.author);

		if(resp === "SUCCESS") casesSet++;
		else if(resp === "NO_CASE") errMsg = `Case \`${casenum}\` not found`;
		else if(resp === "NO_CHANNEL") errMsg = `Mod log channel not set`;
		else if(resp === "NO_MSG") errMsg = `Message from case \`${casenum}\` not found`;
		else errMsg = `Unexpected error`;
	}

	let returnMsg = "";
	if(message.args[0].length === 1 && !errMsg) returnMsg = `:white_check_mark: Set reason for case \`${message.args[0][0]}\``;
	else if(casesSet) returnMsg = `:white_check_mark: Set reason for ${casesSet} cases`;
	if(errMsg) returnMsg += errMsg;
	return returnMsg;
}, {
	perm: "banMembers",
	guildOnly: true,
	type: "moderator",
	description: "Set a reason of a case (or multiple) on the mod log",
	args: [{
		type: "text",
		label: "cases"
	}, {
		type: "text",
		label: "reason"
	}]
});
