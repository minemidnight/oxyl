module.exports = {
	process: async message => {
		if(!message.args[0]) {
			return __("commands.admin.settings.noArgs", message, { settings: Object.keys(settings).join(", ") });
		} else if(!settings[message.args[0]]) {
			return __("commands.admin.settings.invalidSetting", message);
		} else if(!message.args[1]) {
			let setting = settings[message.args[0]];
			setting.name = message.args[0];

			const guild = message.channel.guild;
			let currentValue = (
				await r.table("settings").filter({ name: setting.name, guildID: guild.id }).run()
			)[0];

			return __("commands.admin.settings.settingInfo", message, {
				setting: message.args[0],
				description: settings.description,
				accepted: `${setting.label || `<${setting.arg}>`}|reset`,
				current: currentValue ? currentValue.value : __("words.noValue", message)
			});
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
				return __("commands.admin.setings.cantReset", message, { setting: setting.name });
			} else if(reset || (setting.type === "boolean")) {
				await r.table("settings").get(currentValue.id).delete().run();
				if(setting.name === "prefix") bot.prefixes.delete(message.channel.guild.id);
				return __("commands.admin.settings.resetSuccess", message, { setting: setting.name });
			}

			let insertData = {
				name: setting.name,
				guildID: guild.id
			};

			if(setting.name === "userlog" || setting.name === "modLog.channel") insertData.value = resolvedInput.id;
			else insertData.value = resolvedInput;

			if(setting.name === "modLog.track") {
				let addedRole = true;
				if(!currentValue) {
					insertData.value = [resolvedInput.id];
					await r.table("settings").insert(insertData).run();
				} else {
					let alreadyTracked = currentValue.value.indexOf(resolvedInput.id);
					if(~alreadyTracked) {
						currentValue.value.splice(alreadyTracked, 1);
						addedRole = false;
					} else {
						currentValue.value.push(resolvedInput.id);
					}

					if(currentValue.value.length === 0) {
						await r.table("settings").get(currentValue.id).delete().run();
					} else {
						await r.table("settings").get(currentValue.id).update({ value: currentValue.value }).run();
					}
				}

				return addedRole ?
					`Added \`${resolvedInput.name}\` to tracked roles` :
					`Removed \`${resolvedInput.name}\` from tracked roles`;
			} else if(setting.type === "boolean" && !resolvedInput) {
				if(currentValue) await r.table("settings").filter(currentValue.id).delete().run();
			} else if(currentValue) {
				await r.table("settings").get(currentValue.id).update({ value: insertData.value }).run();
			} else {
				await r.table("settings").insert(insertData).run();
			}

			if(setting.name === "prefix") bot.prefixes.set(message.channel.guild.id, insertData.value);
			return __("commands.admin.settings.setSuccess", message, {
				setting: setting.name,
				value: insertData.value
			});
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

let settings = module.exports.settings = {
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
	},
	"modLog.channel": {
		arg: "textChannel",
		description: "Set the mod log channel to log moderator actions"
	},
	"modLog.track": {
		arg: "role",
		description: "Toggle a roles to make mod log entries for (on role add/remove)"
	},
	"modLog.kickat": {
		arg: "num",
		description: "Amount of warnings before a user will get kicked",
		extra: { min: 1 }
	},
	"modLog.banat": {
		arg: "num",
		description: "Amount of warnings before a user will get banned",
		extra: { min: 1 }
	}
};
