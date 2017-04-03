module.exports = {
	process: async message => {
		if(!message.args[0]) {
			return `__**Valid mod log settings**__:\n${Object.keys(settings).join(", ")}` +
				`\n\nRun \`modlog <setting>\` to get more info on a specific setting`;
		} else if(!settings[message.args[0]]) {
			return `Invalid mog log setting!`;
		} else if(!message.args[1]) {
			let setting = settings[message.args[0]];
			return `__**Setting**__: ${message.args[0]}\n` +
				`Description: ${setting.description}\n` +
				`Usage: <${setting.label || setting.arg}>`;
		} else {
			let setting = settings[message.args[0]];
			try {
				var resolvedInput = bot.utils.resolver[setting.type](message, message.args[1]);
			} catch(err) {
				return err.message;
			}
			return "not finished";
		}
	},
	guildOnly: true,
	description: "Edit various mod log options",
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
	channel: {
		arg: "channel",
		description: "Set the mod log channel"
	},
	style: {
		arg: "text",
		description: "Change the message style (default text)",
		label: "text|embed"
	},
	track: {
		arg: "role",
		description: "Toggle a roles to make mod log entries for (on role add/remove)"
	}
};
