const Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js");

let settings = [
	{ name: "prefix", type: "text", description: "Prefix to trigger a command (adds on to default prefix)" },
	{ name: "modlog", type: "textChannel", description: "Log mod actions such as bans and unbans, with settable reasons" },
	{ name: "musicchannel", type: "textChannel", description: "Channel where music errors, and now playing messages are shown" },
	{ name: "userlog", type: "textChannel", description: "Where to send `userjoin` and `userleave` messages" },
	{ name: "userjoin", type: "tag", description: "Content to send in userlog when a user joins" },
	{ name: "userleave", type: "tag", description: "Content to send in userlog when a user leaves" }
];
exports.settings = settings;
settings = settings.filter(setting => !setting.disabled);

async function handleConfig(message, args) {
	if(!args || !args[0] || args[0].toLowerCase() === "help") {
		return "Provide what setting to see, set or reset, via `setting get/description <name>`," +
			"`setting set <name> <value>` or `setting reset <name>`, otherwise view" +
			"`settings list` for a list of settings";
	} else if(args[0].toLowerCase() === "list") {
		return `All Settings: ${settings.map(setting => `\`${setting.name}\``).join(", ")}`;
	} else if(args[0].toLowerCase() === "get" || args[0].toLowerCase() === "desc" || args[0].toLowerCase() === "description") {
		let setting = settings.find(set => set.name === args[1].toLowerCase());
		if(!setting) return "Invalid setting! Setting not found.";

		let msg = "";
		try {
			let value = await framework.getSetting(message.channel.guild, setting.name);
			msg += `Setting \`${setting.name}\` is \`${value}\``;
		} catch(err) {
			msg += `Setting \`${setting.name}\` is not set`;
		}

		msg += `\nType: ${setting.type} (${configTypes[setting.type].info})`;
		msg += `\nDescription: ${setting.description}`;
		return msg;
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
		label: "help|list|get/description <setting>|set <setting>",
		optional: true
	}]
});

const configTypes = {
	textChannel: {
		info: "a text channel id, name, or mention within the guild",
		validate: (guild, value) => {
			if(value.match(/<#(\d{17,21})>/)) value = value.match(/<#(\d{17,21})>/)[1];
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
		info: "a role id, name, or mention within the guild",
		validate: (guild, value) => {
			if(value.match(/<@&(\d{17,21})>/)) value = value.match(/<#(\d{17,21})>/)[1];
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
