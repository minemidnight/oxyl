const Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js");

var command = new Command("clapify", (message, bot) => {
	if(!message.content) {
		return "please provide a message to clapify";
	} else {
		return `:clap: ${message.content.split(" ").join(" :clap: ")} :clap:`;
	}
}, {
	type: "default",
	description: "Repeat a clap emoji every space of your message",
	args: [{ type: "text" }]
});
