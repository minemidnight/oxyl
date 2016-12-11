const yaml = require("js-yaml"),
	fs = require("fs"),
	Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js"),
	configs = require("../../modules/serverconfigs.js");
const changeConfig = framework.changeConfig;

function handleConfig(message, args) {
	var config = configs.getConfig(message.guild);
	var keys = configs.getConfigKeys(config);
	var configPath = args[0];
	if(!configPath) {
		return `you must provide what value to set! (\`values\` or \`<value>\`)`;
	} else if(configPath === "values") {
		return `paths usable (use this as a argument to see the value): ${framework.codeBlock(keys.join(", "))}`;
	} else if(keys.indexOf(configPath) === -1) {
		return `invalid config path: \`${configPath}\`, view "values" to see what you can set`;
	} else {
		let value = configs.getValue(message.guild, configPath);
		if(!args[1]) {
			if(value === null || value.length === 0) {
				return `current value of \`${configPath}\` **-** No value set\nEnter a value, or "help" to see what type of value to enter`;
			} else {
				return `current value of \`${configPath}\` **-** ${value}\nEnter a value, or "help" to see what type of value to enter`;
			}
		} else if(args[1] === "help") {
			configPath = configPath.split(".");
			for(var i in configPath) {
				config = config[configPath[i]];
			}

			var helpInfo = framework.listConstructor([
				`Type: ${config.type}`,
				`Info: ${configs.configTypes[config.type].info}`,
				`Note: You can reset a value using "reset" if necessary`
			]);
			return `help for \`${configPath.join(".")}\`: ${helpInfo}`;
		} else {
			return configs.setValue(message.guild, configPath, args[1]);
		}
	}
}

var command = new Command("config", (message, bot) => {
	let args = Array.concat(message.args, message.argsPreserved[1].split(" "));
	if(!message.content) {
		return `please provide an argument (\`values\` or \`<value>\`)`;
	} else {
		return handleConfig(message, args);
	}
}, {
	type: "guild owner",
	description: "Configurate Oxyl and his settings per guild",
	args: [{
		type: "text",
		label: "get/set"
	}, {
		type: "custom",
		label: "options",
		optional: true
	}]
});
