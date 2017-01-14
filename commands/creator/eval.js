const util = require("util"),
	Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js");
const config = framework.config;

var command = new Command("eval", async (message, bot) => {
	let guild = message.guild, channel = message.channel, author = message.author, member = message.member;
	// So the executor can use in eval

	let msg = await message.channel.createMessage("Executing code...");
	try {
		var output = await eval(`(async function(){${message.argsPreserved[0]}}).call()`);
		output = util.inspect(output, { depth: 0 }).substring(0, 1900);
		for(var i in config.private) {
			output = output.replace(new RegExp(config.private[i], "ig"), "xPRIVATEx");
		}
		msg.edit(`:white_check_mark: **Output:** ${framework.codeBlock(output)}`);
	} catch(error) {
		msg.edit(`:x: **Error:** ${framework.codeBlock(error)}`);
	}

	return false;
}, {
	type: "creator",
	description: "Execute code",
	args: [{
		type: "text",
		label: "code"
	}]
});
