const math = require("mathjs").eval;
module.exports = {
	process: async message => {
		let result;
		try {
			result = math(message.args[0]);
		} catch(error) {
			result = undefined;
		}

		if(isNaN(result)) return "Invalid equation!";
		else return `**Result:** ${result}`;
	},
	aliases: ["calc"],
	description: "Calculate a math equation",
	args: [{
		type: "text",
		label: "equation"
	}]
};
