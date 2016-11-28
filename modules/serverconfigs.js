const fs = require("fs"),
	yaml = require("js-yaml"),
	Oxyl = require("../oxyl.js"),
	framework = require("../framework.js");
const bot = Oxyl.bot;

exports.getConfigKeys = (obj, prepend) => {
	var keys = Object.keys(obj);
	var fullKeys = [];
	if(!prepend) prepend = "";

	for(var i = 0; i < keys.length; i++) {
		var key = keys[i];
		if(typeof obj[key] === "object") {
			fullKeys = fullKeys.concat(exports.getConfigKeys(obj[key], `${prepend}${key}.`));
		} else if(!obj[key].disabled) {
			fullKeys.push(`${prepend.substring(0, prepend.length - 1)}`);
			break;
		}
	}

	return fullKeys;
};

exports.setValue = (guild, path, newValue) => {
	var config = exports.getConfig(guild);
	var data = config;
	let resultMsg = "error";
	path = path.split(".");
	for(let i in path) {
		data = data[path[i]];
	}

	if(newValue === "reset") {
		let defaultConfig = yaml.safeLoad(framework.defaultConfig);
		for(let i in path) {
			defaultConfig = defaultConfig[path[i]];
		}

		data.value = defaultConfig.value;
		resultMsg = `reset value of \`${path.join(".")}\` (command successfully executed)`;
	} else {
		var dataType = data.type;
		var parsed = configTypes[dataType].validate(guild, newValue);
		if(parsed === null) {
			return `invalid value given, view "help" for help on what to enter`;
		} else if(Array.isArray(data.value)) {
			data.value.push(parsed);
			resultMsg = `added \`${parsed}\` to value of \`${path.join(".")}\` (command successfully executed)`;
		} else {
			data.value = parsed;
			resultMsg = `changed value of \`${path.join(".")}\` to \`${parsed}\` (command successfully executed)`;
		}
	}

	for(let i in path) {
		if(data[path[i]]) {
			config[path[i]] = data[path[i]];
		}
	}

	fs.writeFileSync(exports.getPath(guild), yaml.safeDump(config));
	return resultMsg;
};

exports.deleteConfig = (guild) => {
	var path = exports.getPath(guild);
	if(fs.existsSync(path)) {
		fs.unlinkSync(path);
	}
};

exports.createConfig = (guild) => {
	var path = exports.getPath(guild);
	if(!fs.existsSync(path)) {
		fs.writeFileSync(path, framework.defaultConfig);
	}
};

exports.getPath = (guild) => `./server-configs/${guild.id}.yml`;

exports.getConfig = (guild) => {
	var path = exports.getPath(guild);
	exports.createConfig(guild);
	return yaml.safeLoad(fs.readFileSync(path));
};

exports.getValue = (guild, path) => {
	var data = exports.getConfig(guild);
	path = path.split(".");

	for(var i in path) {
		data = data[path[i]];
	}

	return data.value;
};

bot.on("guildCreate", (guild) => {
	var path = exports.getPath(guild);
	exports.createConfig(guild);
	framework.consoleLog(`Created YML guild config file for ${guild} (\`${path}\`)`, "debug");
});

bot.on("guildDelete", (guild) => {
	var path = exports.getPath(guild);
	exports.deleteConfig(guild);
	framework.consoleLog(`Deleted YML guild config file for ${guild} (\`${path}\`)`, "debug");
});

const configTypes = {
	textChannel: {
		info: "A text channel id or name in the guild",
		validate: (guild, value) => {
			let textChannels = guild.channels.filter(ch => ch.type === "text");
			let foundChannel = textChannels.find(ch => {
				if(value === ch.id || value.toLowerCase() === ch.name.toLowerCase()) {
					return true;
				} else {
					return false;
				}
			});

			if(foundChannel) {
				return foundChannel.id;
			} else {
				return null;
			}
		}
	},
	voiceChannel: {
		info: "A voice channel id or name in the guild",
		validate: (guild, value) => {
			let voiceChannels = guild.channels.filter(ch => ch.type === "voice");
			let foundChannel = voiceChannels.find(ch => {
				if(value === ch.id || value.toLowerCase() === ch.name.toLowerCase()) {
					return true;
				} else {
					return false;
				}
			});

			if(foundChannel) {
				return foundChannel.id;
			} else {
				return null;
			}
		}
	},
	role: {
		info: "A role id or name in the guild",
		validate: (guild, value) => {
			let roles = guild.roles;
			let foundRole = roles.find(role => {
				if(value === role.id || value.toLowerCase() === role.name.toLowerCase()) {
					return true;
				} else {
					return false;
				}
			});

			if(foundRole) {
				return foundRole.id;
			} else {
				return null;
			}
		}
	},
	boolean: {
		info: "A true (yes/enable) or false (no/disable) value",
		validate: (guild, value) => {
			let trueWords = ["true", "yes", "enable"];
			let falseWords = ["false", "no", "disable"];
			if(trueWords.includes(value)) {
				return true;
			} else if(falseWords.includes(value)) {
				return false;
			} else {
				return null;
			}
		}
	},
	int: {
		info: "A whole positive or negative number",
		validate: (guild, value) => {
			value = parseInt(value);
			if(isNaN(value)) {
				return null;
			} else {
				return value;
			}
		}
	},
	text: {
		info: "Any combination of words and letters",
		validate: (guild, value) => value
	}
};
exports.configTypes = configTypes;
