const util = require("util");
module.exports = {
	process: async message => {
		let guild = message.channel.guild, channel = message.channel, author = message.author, member = message.member;
		// So the executor can use in eval

		let msg = await message.channel.createMessage("Executing code...");
		try {
			let output = await eval(`(async function(){${message.args[0]}}).call()`);
			output = util.inspect(output, { depth: 0 }).substring(0, 1900);
			for(let censor in bot.privateConfig) output = output.replace(new RegExp(censor, "ig"), "no u");
			msg.edit(`:white_check_mark: **Output:** ${bot.utils.codeBlock(output, "js")}`);
		} catch(error) {
			msg.edit(`:x: **Error:** ${bot.utils.codeBlock(error)}`);
		}

		return false;
	},
	description: "Execute code",
	args: [{
		type: "text",
		label: "code"
	}]
};