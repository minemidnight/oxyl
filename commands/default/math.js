const Discord = require("discord.js"),
	Oxyl = require("../../oxyl.js"),
	framework = require("../../framework.js"),
	math = require("mathjs");

Oxyl.registerCommand("math", "default", (message, bot) => {
	var result;
	try {
		result = math.eval(message.content);
	} catch(error) {
		result = undefined;
	}
	if(isNaN(result)) {
		return "Invalid Calculation Expression";
	} else {
		return `**Result:** ${result}`;
	}
}, ["calc", "calculate"], "Calculate a math expression", "<expression>");
