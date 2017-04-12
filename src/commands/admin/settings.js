module.exports = {
	process: async message => {
		if(!message.args[0]) {
			return `__**Valid settings**__:\n${Object.keys(settings).join(", ")}` +
				`\n\nRun \`setting <setting>\` to get more info on a specific setting`;
		} else if(!settings[message.args[0]]) {
			return `Invalid setting!`;
		} else if(!message.args[1]) {
			let setting = settings[message.args[0]];
			setting.name = message.args[0];

			const guild = message.channel.guild;
			let currentValue = (
				await r.table("settings").filter({ name: setting.name, guildID: guild.id }).run()
			)[0];

			return `__**Setting**__: ${message.args[0]}\n` +
				`Description: ${setting.description}\n` +
				`Accepted Values: \`${setting.label || `<${setting.arg}>`}|reset\`\n` +
				`Current Value: \`${currentValue ? currentValue.value : "no value"}\``;
		} else {
			let setting = settings[message.args[0]], reset = false;
			setting.name = message.args[0];

			if(message.args[1] === "reset") {
				reset = true;
			} else {
				try {
					var resolvedInput = bot.utils.resolver[setting.arg](message, message.args[1], setting.extra);
				} catch(err) {
					return err.message;
				}
			}

			const guild = message.channel.guild;
			let currentValue = (
				await r.table("settings").filter({ name: setting.name, guildID: guild.id }).run()
			)[0];

			if(!currentValue && reset) {
				return `\`${setting.name}\` cannot be reset because it is not yet set`;
			} else if(reset) {
				await r.table("settings").get(currentValue.id).delete().run();
				if(setting.name === "prefix") bot.prefixes.delete(message.channel.guild.id);
				return `Reset setting \`${setting.name}\``;
			}

			let insertData = {
				name: setting.name,
				guildID: guild.id
			};

			if(setting.name === "userlog") insertData.value = resolvedInput.id;
			else insertData.value = resolvedInput;
			if(currentValue) await r.table("settings").get(currentValue.id).update({ value: insertData.value }).run();
			else await r.table("settings").insert(insertData).run();
			if(setting.name === "prefix") bot.prefixes.set(message.channel.guild.id, insertData.value);
			return `Set \`${setting.name}\` to ${insertData.value}`;
		}
	},
	caseSensitive: true,
	guildOnly: true,
	aliases: ["setting"],
	description: "Configurate Oxyl's settings (per guild)",
	args: [{
		type: "text",
		label: "option",
		optional: true
	}, {
		type: "text",
		label: "value",
		optional: true
	}]
};

let settings = {
	farewell: {
		arg: "text",
		description: "Message sent in user log when a user leaves " +
			"(placeholders: {{mention}}, {{username}}, {{id}}, {{discrim}})"
	},
	greeting: {
		arg: "text",
		description: "Message sent in user log when a user leaves " +
			"(placeholders: {{mention}}, {{username}}, {{id}}, {{discrim}})"
	},
	musicmessages: {
		arg: "boolean",
		description: "Toggle if Oxyl sends now playing and error messages"
	},
	prefix: {
		arg: "text",
		description: "Set the prefix for the server"
	},
	userlog: {
		arg: "textChannel",
		description: "Set the channel which greeting and farewell messages are announced"
	}
};
