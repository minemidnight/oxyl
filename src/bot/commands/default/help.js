module.exports = {
	async run({ args, author, flags: { dm }, guild, t, wiggle }) {
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
			const disabledCommands = await wiggle.locals.r.table("commandSettings")
				.getAll(guild.id, { index: "guildID" })
				.pluck("enabled", "id")
				.filter({ enabled: false })
				.map(wiggle.locals.r.row("id")(1).split(".").nth(-1))
				.run();

			const helpMessage = [...wiggle.categories.values()].reduce((msg, { name, commands, subcommands }) => {
				if(name === "creator") return msg;
				msg += `__**${name.charAt(0).toUpperCase() + name.substring(1)}** `;
				msg += `(${commands.size + subcommands.size} ${t("words.commands")})__\n`;
				msg += commands.filter(command => !~disabledCommands.indexOf(command.name))
					.concat(subcommands.filter(subcommand => !~disabledCommands.indexOf(subcommand.name)))
					.map(({ name: commandName }) => commandName).join(", ");
				msg += "\n\n";

				return msg;
			}, "").trim();

			if(dm) {
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
