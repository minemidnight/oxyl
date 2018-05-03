const fs = require("fs");
const path = require("path");

module.exports = {
	async run({ args: [command], author, flags: { dm }, guild, message: { locale }, t, wiggle }) {
		if(command) {
			categoryLoop:
			for(const { commands, subcommands } of wiggle.categories.values()) {
				if(commands.has(command)) {
					command = commands.get(command);
					break;
				} else {
					for(const [subcommand, { commands: { subcommandCommands } }] of subcommands.values()) {
						if(subcommand === command) {
							command = subcommand;
							break categoryLoop;
						} else if(subcommandCommands.has(command)) {
							command = subcommandCommands.get(command);
							break categoryLoop;
						}
					}
				}
			}

			if(typeof command !== "object") return t("commands.help.noCommandFound");
			try {
				return await new Promise((resolve, reject) => {
					const filePath = path.resolve(__dirname, "..", "..", "..", "..", "locales",
						locale, "help", `${command.name}.md`);

					fs.readFile(filePath, "utf8", (err, data) => {
						if(err) {
							reject(err);
						} else {
							resolve(data
								.replace(/\r\n\r\n/g, "\r\n")
								.replace("{{usage}}", command.usage ? "" : `${command.name} ${command.usage}`)
							);
						}
					});
				});
			} catch(err) {
				return t("commands.help.noDescription");
			}
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
				msg += commands.filter(cmd => !~disabledCommands.indexOf(cmd.name))
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
