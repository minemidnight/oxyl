const util = require("util");
module.exports = {
	process: async message => {
		let guild = message.channel.guild, channel = message.channel, author = message.author, member = message.member; // eslint-disable-line

		try {
			let output = await eval(`(async function(){${message.args[0].replace(/“|”/g, "\"")}}).call()`);
			output = util.inspect(output, { depth: 0 }).substring(0, 1900);
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
