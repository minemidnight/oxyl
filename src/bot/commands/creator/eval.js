const util = require("util");
module.exports = {
	run: async ctx => {
		const { args, author, category, channel, flags, guild, message, reply, Resolver, t, wiggle } = ctx; // eslint-disable-line no-unused-vars, max-len, id-length

		try {
			let output = await eval(`(async function(){${message.content.replace(/“|”/g, "\"")}}).call()`);
			output = util.inspect(output, { depth: 0 })
				.substring(0, 1950)
				.replace(new RegExp(wiggle.locals.config.token, "gi"), "");

			return `:white_check_mark: **Output:** \`\`\`js\n${output}\n\`\`\``;
		} catch(error) {
			return `:x: **Error:** \`\`\`\n${error}\n\`\`\``;
		}
	},
	args: [{ type: "text", label: "input" }],
	caseSensitive: true
};
