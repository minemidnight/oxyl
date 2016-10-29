const Discord = require("discord.js"),
      Oxyl = require("../oxyl.js");

Oxyl.registerCommand("eval", "creator", (message, bot) => {
  try {
    var output = eval(message.content);
    return `**Output:** ${output}`;
  } catch (err) {
    return `**Error:** ${err}`;
  }
}, [], "Execute code", "<code>");
