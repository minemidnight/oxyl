const util = require("util"),
	Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js");

var command = new Command("eval", (message, bot) => {
	var guild = message.guild, channel = message.channel;
	var editMsg = message.reply("executing code...");
	try {
		var output = util.inspect(eval(message.contentPreserved), { depth: 0 });
		Promise.resolve(editMsg).then(msg => msg.edit(`:white_check_mark: **Output:** ${framework.codeBlock(output)}`));
	} catch(error) {
		Promise.resolve(editMsg).then(msg => msg.edit(`:x: **Error:** ${framework.codeBlock(error)}`));
	}
}, {
	type: "creator",
	description: "Execute code",
	args: [{
		type: "text",
		label: "code"
	}]
});
