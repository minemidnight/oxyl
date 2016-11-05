const Discord = require("discord.js"),
      util = require("util"),
      Oxyl = require("../oxyl.js");

Oxyl.registerCommand("eval", "creator", (message, bot) => {
  var guild = message.guild, channel = message.channel;
  try {
    var output = util.inspect(eval(message.content), {depth: 0});
    return `**Output:**` + "\n```" + `${output}` + "\n```";
  } catch (err) {
    return `**Error:**` + "\n```" + `${err}` + "\n```";
  }
}, [], "Execute code", "<code>");
