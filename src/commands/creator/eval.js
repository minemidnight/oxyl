const util = require("util");
module.exports = {
	process: async message => {
		let guild = message.channel.guild, channel = message.channel, author = message.author, member = message.member;
		// So the executor can use in eval

		try {
			let output = await eval(`(async function(){${message.args[0]}}).call()`);
			output = util.inspect(output, { depth: 0 }).substring(0, 1900);
			for(let i in bot.privateConfig) {
				if(typeof bot.privateConfig[i] === "string") {
					output = output.replace(new RegExp(bot.privateConfig[i], "ig"), "");
				} else if(Array.isArray(bot.privateConfig[i])) {
					bot.privateConfig[i].forEach(val => output = output.replace(new RegExp(val, "ig"), ""));
				} else if(bot.privateConfig[i].password) {
					output = output.replace(new RegExp(bot.privateConfig[i].password, "ig"), "");
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
