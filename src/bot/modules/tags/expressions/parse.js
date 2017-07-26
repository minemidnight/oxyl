module.exports = {
	name: "Parse",
	description: "Text parsed as a different type",
	examples: [`set {_user} to {_arg1} parsed as a user`],
	patterns: [`%text% parsed as [a[n]] %type%`],
	returns: "any",
	run: async (options, any, type) => {
		if(type === "integer") {
			return options.types.integer(parseInt(any));
		} else if(type === "number") {
			return options.types.number(parseFloat(any));
		} else if(type === "boolean") {
			return options.type.boolean(bot.utils.resolver.boolean(null, any));
		} else if(type === "role") {
			return options.type.role(bot.utils.resolver.role(options.__message, any));
		} else if(type === "channel") {
			return options.type.channel(bot.utils.resolver.textChannel(options.__message, any));
		} else if(type === "user") {
			return options.type.user(await bot.utils.resolver.user(options.__message, any));
		} else if(type === "member") {
			let user = await bot.utils.resolver.user(options.__message, any);
			let member = options.__message.channel.guild.members.get(user.id);
			if(!member) throw new options.TagError(`Tried to get member, but is not in server`);
			else return options.type.member(member);
		} else {
			throw new options.TagError(`Invalid parse type: ${type}. ` +
			`Accepted types: integer, number, boolean, role, channel, user, member`);
		}
	}
};
