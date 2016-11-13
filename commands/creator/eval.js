const Discord = require("discord.js"),
	util = require("util"),
	Oxyl = require("../../oxyl.js"),
	framework = require("../../framework.js");

Oxyl.registerCommand("eval", "creator", (message, bot) => {
	var guild = message.guild, channel = message.channel;
	var editMsg = message.reply("executing code...");
	try {
		var output = util.inspect(eval(message.content), { depth: 0 });
		Promise.resolve(editMsg).then(msg => msg.edit(`**Output:** ${framework.codeBlock(output)}`));
	} catch(error) {
		Promise.resolve(editMsg).then(msg => msg.edit(`**Error:** ${framework.codeBlock(error)}`));
	}
}, [], "Execute code", "<code>");
