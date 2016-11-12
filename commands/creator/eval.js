const Discord = require("discord.js"),
	util = require("util"),
	Oxyl = require("../../oxyl.js"),
	framework = require("../../framework.js");

Oxyl.registerCommand("eval", "creator", (message, bot) => {
	var guild = message.guild, channel = message.channel;
	try {
		var output = util.inspect(eval(message.content), { depth: 0 });
		return `**Output:** ${framework.codeBlock(output)}`;
	} catch(error) {
		return `**Error:** ${framework.codeBlock(error)}`;
	}
}, [], "Execute code", "<code>");
