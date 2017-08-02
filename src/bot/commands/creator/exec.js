const exec = Promise.promisify(require("child_process").exec);
module.exports = {
	process: async message => {
		try {
			let stdout = await exec(message.args[0], { maxBuffer: Infinity });
			return bot.utils.codeBlock(stdout.substring(0, 1950));
		} catch(err) {
			return `Error executing command: ${bot.utils.codeBlock(err)}`;
		}
	},
	caseSensitive: true,
	description: "Execute code",
	args: [{
		type: "text",
		label: "command"
	}]
};
