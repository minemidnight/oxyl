const Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js");

let settings = [{ name: "prefix", type: "text" },
{ name: "modlog", type: "textChannel" },
{ name: "musicchannel", type: "textChannel" },
{ name: "userlog", type: "textChannel" },
{ name: "userjoin", type: "tag" },
{ name: "userleave", type: "tag" }];
exports.settings = settings;
settings = settings.filter(setting => !setting.disabled);

async function handleConfig(message, args) {
	if(!args || !args[0] || args[0].toLowerCase() === "help") {
		return "Provide what setting to see, set or reset, via `setting get <name>`," +
			"`setting set <name> <value>` or `setting reset <name>`, otherwise view" +
			"`settings list` for a list of settings";
	} else if(args[0].toLowerCase() === "list") {
		return `All Settings: ${settings.map(setting => `\`${setting.name}\``).join(", ")}`;
	} else if(args[0].toLowerCase() === "get") {
		let setting = settings.find(set => set.name === args[1].toLowerCase());
		if(!setting) return "Invalid setting! Setting not found.";

		let value;
		try {
			value = await framework.getSetting(message.channel.guild, setting.name);
			return `Setting \`${setting.name}\` is \`${value}\``;
		} catch(err) {
			return `Setting \`${setting.name}\` is not set`;
		}
	} else if(args[0].toLowerCase() === "reset") {
		let setting = settings.find(set => set.name === args[1].toLowerCase());
		if(!setting) return "Invalid setting! Setting not found.";

		let value;
		try {
			value = await framework.getSetting(message.channel.guild, setting.name);
			framework.resetSetting(message.channel.guild, setting.name);
			return `Setting \`${setting.name}\` reset`;
		} catch(err) {
			return `Setting \`${setting.name}\` is not set`;
		}
	} else if(args[0].toLowerCase() === "set") {
		let setting = settings.find(set => set.name === args[1].toLowerCase());
		if(!setting) return "Invalid setting! Setting not found.";

		let value = message.argsPreserved[0];
		value = value.substring(value.toLowerCase().indexOf(setting.name) + setting.name.length + 1);
		if(!value || value.length === 0) return `Please provide a value for \`${setting.name}\` (${configTypes[setting.type].info})`;
		value = configTypes[setting.type].validate(message.channel.guild, value);

		if(value === null) return `Invalid input given, please provide ${configTypes[setting.type].info}`;
		framework.setSetting(message.channel.guild, setting.name, value);
		return `Set \`${setting.name}\` to \`${value}\` (success!)`;
	} else {
		return "Invalid argument -- view `settings help`";
	}
}

var command = new Command("settings", async (message, bot) => {
	let args = message.argsPreserved[0].split(" ");
	return await handleConfig(message, args);
}, {
	cooldown: 2500,
	guildOnly: true,
	type: "guild owner",
	aliases: ["setting"],
	description: "Configurate Oxyl's settings per guild",
	args: [{
		type: "text",
		label: "help|list|get <setting>|set <setting>",
		optional: true
	}]
});

const configTypes = {
	textChannel: {
		info: "a text channel id or name within the guild",
		validate: (guild, value) => {
			let textChannels = guild.channels.filter(ch => ch.type === 0);
			let foundChannel = textChannels.find(ch => {
				if(value === ch.id || value.toLowerCase() === ch.name.toLowerCase()) return true;
				else return false;
			});

			if(foundChannel) return foundChannel.id;
			else return null;
		}
	},
	voiceChannel: {
		info: "a voice channel id or name within the guild",
		validate: (guild, value) => {
			let voiceChannels = guild.channels.filter(ch => ch.type === 2);
			let foundChannel = voiceChannels.find(ch => {
				if(value === ch.id || value.toLowerCase() === ch.name.toLowerCase()) return true;
				else return false;
			});

			if(foundChannel) return foundChannel.id;
			else return null;
		}
	},
	role: {
		info: "a role id or name within the guild",
		validate: (guild, value) => {
			let roles = guild.roles;
			let foundRole = roles.find(role => {
				if(value === role.id || value.toLowerCase() === role.name.toLowerCase()) {
					return true;
				} else {
					return false;
				}
			});

			if(foundRole) return foundRole.id;
			else return null;
		}
	},
	boolean: {
		info: "a true (yes/enable) or false (no/disable) value",
		validate: (guild, value) => {
			let trueWords = ["true", "yes", "enable"];
			let falseWords = ["false", "no", "disable"];
			if(trueWords.includes(value)) return true;
			else if(falseWords.includes(value)) return false;
			else return null;
		}
	},
	int: {
		info: "a whole positive or negative number",
		validate: (guild, value) => {
			value = parseInt(value);
			if(isNaN(value)) return null;
			else return value;
		}
	},
	text: {
		info: "any combination of words and letters",
		validate: (guild, value) => value
	},
	tag: {
		info: "message using the tag format (http://minemidnight.work/tags)",
		validate: (guild, value) => value
	}
};
exports.configTypes = configTypes;
