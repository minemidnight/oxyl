const Discord = require("discord.js"),
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
}, [], "Execute code", "<code>");
