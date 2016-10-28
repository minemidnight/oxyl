const Discord = require("discord.js"),
      Oxyl = require("../oxyl.js");

Oxyl.registerCommand("eval", "creator", (message) => {
  try {
    var output = eval(message.content);
    return "**Output:** " + output;
  } catch (e) {
    return "**Error:** " + e;
  }
}, [], "Execute code", "<code>");
