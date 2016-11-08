const Discord = require("discord.js");
const	bot = new Discord.Client();
const	fs = require("fs");
const	yaml = require("js-yaml");

exports.bot = bot;
exports.config = yaml.safeLoad(fs.readFileSync("./private/config.yml"));
exports.defaultConfig = fs.readFileSync("./private/default-config.yml");
exports.commands = {};

process.on("unhandledRejection", (err) => {
	consoleLog(`Uncaught Promise Error: \n\`\`\`\n${err.stack}\n\`\`\``, "debug");
});

var formatDate = (toFormat) => {
	var date = new Date(toFormat);
	var months = ["January", "February", "March", "April", "May", "June", "July",
		"August", "September", "October", "November", "Decemeber"];
	var weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

	var month = months[date.getMonth()];
	var day = date.getDate();
	var weekday = weekdays[date.getDay()];
	var hour = date.getHours();
	var min = date.getMinutes();
	var sec = date.getSeconds();
	var year = date.getFullYear();

	day = (day < 10 ? "0" : "") + day;
	hour = (hour < 10 ? "0" : "") + hour;
	min = (min < 10 ? "0" : "") + min;
	sec = (sec < 10 ? "0" : "") + sec;

	return `${weekday}, ${month} ${day} ${year}, ${hour}:${min}:${sec}`;
};

var codeBlock = (content) => {
	let returnVal = "\n```\n";
	returnVal += content;
	returnVal += "\n```";
	return returnVal;
};

var registerCommand = (name, type, callback, aliases, description, usage) => {
	if(!exports.commands[type]) {
		exports.commands[type] = {};
	}
	exports.commands[type][name] = {};
	exports.commands[type][name].aliases = aliases;
	exports.commands[type][name].description = description;
	exports.commands[type][name].usage = usage;
	exports.commands[type][name].process = callback;
};

var loadScript = (path, reload) => {
	require(path);
	if(reload) {
		consoleLog(`Reloaded script at ${path}`, "debug");
	} else {
		consoleLog(`Loaded script at ${path}`, "debug");
	}
};

var changeConfig = (guildId, callback) => {
	var path = `./server-configs/${guildId}.yml`;
	var data = yaml.safeLoad(fs.readFileSync(path));
	fs.writeFileSync(path, yaml.safeDump(data));
	consoleLog(`Edited config in \`${path}\`\n\n\`\`\`\n${callback}\n\`\`\``, "debug");
	return callback();
};

var getConfigValue = (guildId, name) => {
	var path = `./server-configs/${guildId}.yml`;
	var data = yaml.safeLoad(fs.readFileSync(path));
	return data[name];
};

var consoleLog = (message, type) => {
	var channel;
	if(type === "important" || type === "!") {
		console.log(`[!] ${message}`);
		channel = "important";
	} else if(type === "dm") {
		console.log(`[DM] ${message}`);
		channel = "dm";
	} else if(type === "command" || type === "cmd") {
		console.log(`[CMD] ${message}`);
		channel = "commands";
	} else if(type === "debug") {
		if(exports.config.options.debugMode) {
			console.log(`[DEBUG] ${message}`);
			channel = "debug";
		}
	}
	channel = exports.config.channels[channel];
	channel = bot.channels.get(channel);
	if(channel) {
		channel.sendMessage(message);
	}
};

exports.formatDate = formatDate;
exports.codeBlock = codeBlock;
exports.registerCommand = registerCommand;
exports.loadScript = loadScript;
exports.changeConfig = changeConfig;
exports.getConfigValue = getConfigValue;
exports.consoleLog = consoleLog;

var loadDirectory = (path) => {
	var dirFiles = fs.readdirSync(path);
	dirFiles.forEach(script => {
		if(script.substring(script.length - 3, script.length) === ".js") {
			loadScript(`${path}${script}`);
		}
	});
};

loadDirectory("./modules/");
loadDirectory("./commands/");
