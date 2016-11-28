const Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js"),
	math = require("mathjs");

var command = new Command("math", (message, bot) => {
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
}, {
	type: "default",
	aliases: ["calc", "calculate"],
	description: "Calculate a math expression",
	args: [{
		type: "text",
		label: "expression"
	}]
});
