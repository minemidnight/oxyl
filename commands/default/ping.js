const Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js");

var command = new Command("ping", async (message, bot) => {
	let time = Date.now();
	let msg = await message.channel.createMessage("Pong!");
	msg.edit(`Pong! \`${Date.now() - time}ms\``);
}, {
	type: "default",
	description: "Test the bot's responsiveness"
});
