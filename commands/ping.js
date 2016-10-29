const Discord = require("discord.js"),
      Oxyl = require("../oxyl.js");

Oxyl.registerCommand("ping", "default", (message, bot) => {
  var time = Date.now()
  message.channel.sendMessage("Pong!").then(m => {
    m.edit(`Pong! \`${Date.now() - time}ms\``);
  });
}, ["responsetime"], "Test the bot's responsiveness", "[]");
