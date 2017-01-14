const Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js");

var command = new Command("clapify", async (message, bot) => {
	let replaced = message.argsPreserved[0].replace(/ /g, " :clap: ");
	return `:clap: ${replaced} :clap:`;
}, {
	type: "default",
	description: "Repeat a clap emoji every space of your message",
	args: [{ type: "text" }]
});
