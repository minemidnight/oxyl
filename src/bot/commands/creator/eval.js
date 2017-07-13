const util = require("util");
module.exports = {
	process: async message => {
		let guild = message.channel.guild, channel = message.channel, author = message.author, member = message.member;
		// So the executor can use in eval

		try {
			let output = await eval(`(async function(){${message.args[0]}}).call()`);
			output = util.inspect(output, { depth: 0 }).substring(0, 1900);
			for(let i of bot.config.bot) {
				if(typeof i === "string") {
					output = output.replace(new RegExp(i, "ig"), "");
				} else if(Array.isArray(i)) {
					i.forEach(val => output = output.replace(new RegExp(val, "ig"), ""));
				} else if(i) {
					output = output.replace(new RegExp(i, "ig"), "");
				}
			}
			return `:white_check_mark: **Output:** ${bot.utils.codeBlock(output, "js")}`;
		} catch(error) {
			return `:x: **Error:** ${bot.utils.codeBlock(error)}`;
		}
	},
	caseSensitive: true,
	description: "Execute code",
	args: [{
		type: "text",
		label: "code"
	}]
};
