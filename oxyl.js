const Discord = require("discord.js"),
	path = require("path"),
	framework = require(path.resolve(__dirname, "./framework.js"));
const bot = new Discord.Client();
exports.bot = bot;

process.on("unhandledRejection", (err) => {
	framework.consoleLog(`Unhandled Rejection: ${framework.codeBlock(err.stack)}`, "debug");
});

process.on('uncaughtException', (err) => {
	framework.consoleLog(`Uncaught Exception: ${framework.codeBlock(err.stack)}`, "debug");
});

exports.registerCommand = (name, type, callback, aliases, description, usage) => {
	if(!exports.commands[type]) {
		framework.commands[type] = {};
	}
	framework.commands[type][name] = {};
	framework.commands[type][name].aliases = aliases;
	framework.commands[type][name].description = description;
	framework.commands[type][name].usage = usage;
	framework.commands[type][name].process = callback;
};

exports.commands = framework.commands;

framework.loadScripts("./commands/");
framework.loadScripts("./modules/");
