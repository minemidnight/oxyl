const Discord = require("discord.js"),
<<<<<<< HEAD
	util = require("util"),
	Oxyl = require("../oxyl.js");

Oxyl.registerCommand("eval", "creator", (message, bot) => {
	var guild = message.guild, channel = message.channel;
	try {
		var output = util.inspect(eval(message.content), { depth: 0 });
		return `**Output:** ${Oxyl.codeBlock(output)}`;
	} catch(error) {
		return `**Error:** ${Oxyl.codeBlock(error)}`
	}
=======
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
>>>>>>> origin/master
}, [], "Execute code", "<code>");
