const util = require("util"),
	Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js");
const config = framework.config;

var command = new Command("eval", (message, bot) => {
	let guild = message.guild, channel = message.channel, author = message.author;
	// So the executor can use in eval

	let editMsg = message.channel.createMessage("Executing code...");
	try {
		var output = util.inspect(eval(message.argsPreserved[0]), { depth: 0 }).substring(0, 1900);
		for(var i in config.private) {
			output = output.replace(new RegExp(config.private[i], "ig"), "xPRIVATEx");
		}
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
