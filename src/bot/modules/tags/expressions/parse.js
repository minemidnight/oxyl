module.exports = {
	name: "Parse",
	description: "Text parsed as a different type",
	examples: [`set {_user} to {_arg1} parsed as a user`],
	patterns: [`%text% parsed as [a[n]] %type%`],
	run: async (options, any, type) => {
		if(type === "integer") {
			return parseInt(any);
		} else if(type === "number") {
			return parseFloat(any);
		} else if(type === "boolean") {
			return bot.utils.resolver.boolean(null, any);
		} else if(type === "role") {
			return bot.utils.resolver.role(options.__message, any);
		} else if(type === "channel") {
			return bot.utils.resolver.textChannel(options.__message, any);
		} else if(type === "user") {
			return await bot.utils.resolver.user(options.__message, any);
		} else {
			return new options.TagError(`Invalid parse type: ${type}. ` +
			`Accepted types: integer, number, boolean, role, channel, user`);
		}
	}
};
