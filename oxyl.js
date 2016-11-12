const Discord = require("discord.js");
const	bot = new Discord.Client();
exports.bot = bot;
const path = require("path");
const framework = require(path.resolve(__dirname, "./framework.js"));

process.on("unhandledRejection", (err) => {
	framework.consoleLog(`Uncaught Promise Error: ${framework.codeBlock(err.stack)}`, "debug");
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
