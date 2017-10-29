module.exports = {
	run: async ({ args, author, flags, t, wiggle }) => {
		if(args[0]) {
			const command = wiggle.categories.map(category => category.commands.get(args[0])).find(cmd => cmd);
			if(!command) return t("commands.help.noCommandFound");

			return t("commands.help.command", {
				category: command.category,
				description: t(`description.${command.name}`),
				name: command.name,
				usage: command.usage
			});
		} else {
			const helpMessage = [...wiggle.categories.values()].reduce((msg, { name, commands }) => {
				if(name === "creator") return msg;
				msg += `__**${name.charAt(0).toUpperCase() + name.substring(1)}** `;
				msg += `(${commands.size} ${t("words.commands")})__\n`;
				msg += [...commands.values()].map(({ name: commandName }) => commandName).join(", ");
				msg += "\n\n";

				return msg;
			}, "").trim();

			if(flags.dm) {
				await author.createMessage(t("commands.help", { message: helpMessage }));
				return t("commands.help.sentDM");
			} else {
				return t("commands.help", { message: helpMessage });
			}
		}
	},
	args: [{
		type: "text",
		label: "command",
		optional: true
	}],
	flags: [{
		name: "dm",
		short: "d",
		type: "boolean",
		default: false
	}]
};
