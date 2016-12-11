const Discord = require("discord.js"),
	framework = require("./framework.js");
const bot = new Discord.Client({ fetchAllMembers: true });

exports.bot = bot;
exports.commands = {};

process.on("unhandledRejection", (err) => {
	if(!err.stack) {
		framework.consoleLog(`Unhandled Rejection: ${framework.codeBlock(err)}`, "debug");
	} else {
		framework.consoleLog(`Unhandled Rejection: ${framework.codeBlock(err.stack)}`, "debug");
	}
});

exports.addCommand = (command) => {
	if(!exports.commands[command.type]) exports.commands[command.type] = {};
	exports.commands[command.type][command.name] = command;
};

framework.loadScripts("./commands/");
framework.loadScripts("./modules/");

var postStats = require("./modules/statPoster.js");
setInterval(() => { postStats(); }, 600000);
