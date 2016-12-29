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
		return `You must provide what value to set! (\`values\` or \`<value>\`)`;
	} else if(configPath === "values") {
		return `Paths usable (use this as a argument to see the value): ${framework.codeBlock(keys.join(", "))}`;
	} else if(keys.indexOf(configPath) === -1) {
		return `Invalid config path: \`${configPath}\`, view "values" to see what you can set`;
	} else {
		let value = configs.getValue(message.guild, configPath);
		if(!args[1]) {
			if(value === null || value.length === 0) {
				return `Current value of \`${configPath}\` **-** No value set\nRetry with a value, or "help" to see what type of value to enter`;
			} else {
				return `Current value of \`${configPath}\` **-** ${value}\nRetry with a value, or "help" to see what type of value to enter`;
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
			return `Help for \`${configPath.join(".")}\`: ${helpInfo}`;
		} else {
			return configs.setValue(message.guild, configPath, args[1]);
		}
	}
}

var command = new Command("config", (message, bot) => {
	if(!message.argsPreserved[0]) {
		return `Please provide an argument (\`values\` or \`<value>\`)`;
	} else {
		let args = message.argsPreserved[0].split(" ");
		return handleConfig(message, args);
	}
}, {
	guildOnly: true,
	type: "guild owner",
	description: "Configurate Oxyl and his settings per guild",
	args: [{
		type: "text",
		label: "options"
	}]
});
