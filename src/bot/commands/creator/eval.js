const util = require("util");
module.exports = {
	async run(ctx) {
		const { args, author, category, channel, client, flags, guild, message, reply, resolver, t, wiggle } = ctx; // eslint-disable-line no-unused-vars, max-len, id-length

		try {
			let output;
			if(flags.target) {
				let targetValue = null;
				if(flags.target === "m") {
					flags.target = "master";
				} else if(flags.target === "p") {
					flags.target = "panel";
				} else if(flags.target !== "site" && flags.target.startsWith("s")) {
					targetValue = parseInt(flags.target.substring(1));
					flags.target = "shard";
				} else if(flags.target !== "ws" && flags.target.startsWith("w")) {
					targetValue = parseInt(flags.target.substring(1));
					flags.target = "worker";
				} else if(~["g", "bots"].indexOf(flags.target)) {
					flags.target = "allBots";
				} else if(flags.target.startsWith("g")) {
					flags.target = flags.target.substring(1);
					flags.target = "guild";
				}

				output = await process.output({
					op: "eval",
					target: flags.target,
					targetValue,
					input: args[0]
				});
			} else {
				output = await eval(`(async function(){${args[0]}}).call()`);
			}

			output = util.inspect(output, { depth: 0 })
				.substring(0, 1950)
				.replace(new RegExp(wiggle.locals.config.token, "gi"), "");

			return `:white_check_mark: **Output:** \`\`\`js\n${output}\n\`\`\``;
		} catch(error) {
			return `:x: **Error:** \`\`\`\n${error}\n\`\`\``;
		}
	},
	args: [{ type: "text", label: "input" }],
	flags: [{
		name: "target",
		short: "t",
		type: "text"
	}],
	caseSensitive: true
};
