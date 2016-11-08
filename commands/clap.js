const Discord = require("discord.js"),
<<<<<<< HEAD
	Oxyl = require("../oxyl.js");

Oxyl.registerCommand("clapify", "default", (message, bot) => {
	if(!message.content) {
		return "please provide a message to clapify";
	} else {
		return `:clap: ${message.content.split(" ").join(" :clap: ")} :clap:`;
	}
=======
      Oxyl = require("../oxyl.js");

Oxyl.registerCommand("clapify", "default", (message, bot) => {
  if (!message.content) {
    return "please provide a message to clapify";
  } else {
    return message.content.split(" ").join(" :clap: ");
  }
>>>>>>> origin/master
}, [], "Make each space of your message have claps instead", "<text>");
