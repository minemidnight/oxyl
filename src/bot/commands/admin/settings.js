module.exports = {
	process: async message => {
		if(!message.args[0]) {
			return __("commands.admin.settings.noArgs", message, { settings: Object.keys(settings).join(", ") });
		}

		let settingKey = Object.keys(settings).find(key => key.toLowerCase() === message.args[0].toLowerCase());
		if(settings[settingKey]) {
			var setting = settings[settingKey];
			setting.name = settingKey;
		}

		if(!setting) {
			return __("commands.admin.settings.invalidSetting", message);
		} else if(!message.args[1]) {
			const guild = message.channel.guild;
			let currentValue = await r.table("settings").get([setting.name, guild.id]).run();

			return __("commands.admin.settings.settingInfo", message, {
				setting: setting.name,
				description: setting.description,
				accepted: `${setting.label || `<${setting.arg}>`}|reset`,
				current: currentValue ? currentValue.value : __("words.noValue", message)
			});
		} else {
			let reset = false;

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
			let currentValue = await r.table("settings").get([setting.name, guild.id]).run();

			if(!currentValue && reset) {
				return __("commands.admin.settings.cantReset", message, { setting: setting.name });
			} else if(reset || (setting.type === "boolean")) {
				await r.table("settings").get([setting.name, guild.id]).delete().run();
				if(setting.name === "prefix") bot.prefixes.delete(message.channel.guild.id);
				return __("commands.admin.settings.resetSuccess", message, { setting: setting.name });
			}

			let insertData = {
				id: [setting.name, guild.id],
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
						await r.table("settings").get([setting.name, guild.id]).delete().run();
					} else {
						await r.table("settings").get([setting.name, guild.id]).update({ value: currentValue.value }).run();
					}
				}

				return addedRole ?
					`Added \`${resolvedInput.name}\` to tracked roles` :
					`Removed \`${resolvedInput.name}\` from tracked roles`;
			} else if(setting.type === "boolean" && !resolvedInput) {
				if(currentValue) await r.table("settings").get([setting.name, guild.id]).delete().run();
			} else if(currentValue) {
				await r.table("settings").get([setting.name, guild.id]).update({ value: insertData.value }).run();
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
	channels: {
		arg: "boolean",
		description: "Toggle whether or not the `channel` comamnd is usable"
	},
	farewell: {
		arg: "text",
		description: "Message sent in user log when a user leaves " +
			"(placeholders: {{mention}}, {{username}}, {{id}}, {{discrim}})"
	},
	greeting: {
		arg: "text",
		description: "Message sent in user log when a user joins " +
			"(placeholders: {{mention}}, {{username}}, {{id}}, {{discrim}})"
	},
	"greeting-dm": {
		arg: "boolean",
		description: "Toggle if Oxyl dm's join messages or sends them in a channel"
	},
	"disable-music-messages": {
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
