const Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js");

var command = new Command("suggest", async (message, bot) => {
	framework.consoleLog(`Suggestion from ${framework.unmention(message.author)} (${message.author.id}):` +
		`${framework.codeBlock(message.argsPreserved[0])}`, "suggestions");
	return "Sent suggestion!";
}, {
	cooldown: 30000,
	type: "default",
	description: "Suggest a feature, and send it to the Support Server",
	args: [{
		type: "text",
		label: "message"
	}]
});
