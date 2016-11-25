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
	setTimeout(() => { process.exit(0); }, 2500);
});

exports.registerCommand = (name, type, callback, aliases, description, usage) => {
	if(!exports.commands[type]) {
		framework.commands[type] = {};
	}

	framework.commands[type][name] = {
		aliases: aliases,
		description: description,
		usage: usage,
		process: callback
	};
};

exports.commands = framework.commands;

framework.loadScripts("./commands/");
framework.loadScripts("./modules/");
