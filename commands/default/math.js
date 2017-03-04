const math = require("expr-eval").Parser;
exports.cmd = new Oxyl.Command("math", async message => {
	let result;
	try {
		result = math.evaluate(message.args[0]);
	} catch(error) {
		result = undefined;
	}

	if(isNaN(result)) return "Invalid Calculation Expression";
	else return `**Result:** ${result}`;
}, {
	type: "default",
	aliases: ["calc", "calculate"],
	description: "Calculate a math expression",
	args: [{
		type: "text",
		label: "expression"
	}]
});
