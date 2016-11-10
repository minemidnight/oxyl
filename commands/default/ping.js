const Discord = require("discord.js"),
	Oxyl = require("./../oxyl.js");

Oxyl.registerCommand("ping", "default", (message, bot) => {
	var time = Date.now();
	message.channel.sendMessage("Pong!").then(msg => {
		msg.edit(`Pong! \`${Date.now() - time}ms\``);
	});
}, [], "Test the bot's responsiveness", "[]");
