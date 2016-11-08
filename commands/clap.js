const Discord = require("discord.js"),
	Oxyl = require("../oxyl.js");

Oxyl.registerCommand("clapify", "default", (message, bot) => {
	if(!message.content) {
		return "please provide a message to clapify";
	} else {
		return `:clap: ${message.content.split(" ").join(" :clap: ")} :clap:`;
	}
}, [], "Make each space of your message have claps instead", "<text>");
