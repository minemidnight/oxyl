const Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js");

var command = new Command("ping", (message, bot) => {
	let time = Date.now();
	message.channel.sendMessage("Pong!").then(msg => {
		msg.edit(`Pong! \`${Date.now() - time}ms\``);
	});
}, {
	type: "default",
	description: "Test the bot's responsiveness"
});
