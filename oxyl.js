const Discord = require("discord.js"),
	framework = require("./framework.js");
const bot = new Discord.Client();
exports.bot = bot;
exports.commands = {};

process.on("unhandledRejection", (err) => {
	framework.consoleLog(`Unhandled Rejection: ${framework.codeBlock(err.stack)}`, "debug");
});

exports.addCommand = (command) => {
	if(!exports.commands[command.type]) exports.commands[command.type] = {};
	exports.commands[command.type][command.name] = command;
};

framework.loadScripts("./commands/");
framework.loadScripts("./modules/");
