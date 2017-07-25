const exec = Promise.promisify(require("child_process").exec);
module.exports = {
	process: async message => {
		try {
			let stdout = await exec(message.args[0]);
			return bot.utils.codeBlock(stdout);
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
