const Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js");

var command = new Command("bugreport", (message, bot) => {
	framework.consoleLog(`Bug report from ${framework.unmention(message.author)} ${message.author.id}:` +
		`${framework.codeBlock(message.argsPreserved[0])}`, "bugs");
	return "Sent bug report!";
}, {
	cooldown: 30000,
	type: "default",
	description: "Report a bug, and send it to the Support Server",
	args: [{
		type: "text",
		label: "message"
	}]
});
