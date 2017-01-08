const Eris = require("eris"),
	framework = require("./framework.js");

const bot = new Eris(framework.config.private.token, {seedVoiceConnections: true});

process.on("unhandledRejection", (err) => {
	if(!err) return;
	err = err.stack || err;
	framework.consoleLog(`Unhandled Rejection: ${framework.codeBlock(err)}`, "debug");
});

exports.addCommand = (command) => {
	if(!exports.commands[command.type]) exports.commands[command.type] = {};
	exports.commands[command.type][command.name] = command;
};

exports.bot = bot;
exports.commands = {};

exports.cmdScripts = framework.loadScripts("./commands/");
exports.modScripts = framework.loadScripts("./modules/");
exports.siteScripts = framework.loadScripts("./site/");

exports.postStats = require("./modules/statPoster.js");
setInterval(() => exports.postStats(), 1800000);
