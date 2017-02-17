const Eris = require("eris");
global.framework = require("./framework.js");

global.bot = new Eris(framework.config.private.token, {
	maxShards: framework.config.options.shards,
	messageLimit: 0
});

process.stdin.resume();
process.on("SIGINT", () => {
	exports.modScripts.music.managerDump();
	Object.keys(exports.managers)
	.map(man => exports.managers[man])
	.filter(man => man.data.playing)
	.forEach(man => man.sendEmbed("restart"));

	setTimeout(() => {
		bot.disconnect({ reconnect: false });
		process.exit(0);
	}, 5000);
});

process.on("unhandledRejection", err => {
	if(!err) return;
	try {
		let resp = JSON.parse(err.response);
		// these codes mean someone bamboozled oxyl's perms or someone's bamboozled their server
		if(resp.code === 50013 || resp.code === 10008 || resp.code === 50001 || resp.code === 40005 || resp.code === 10003) return;
		else throw err;
	} catch(err2) {
		err = err.stack.substring(0, 1900) || err;
		framework.consoleLog(`Unhandled Rejection: ${framework.codeBlock(err)}`, "debug");
	}
});

process.on("uncaughtException", err => {
	if(!err) return;
	if(err.code === "ECONNRESET" && err.message === "socket hang up") {
		framework.consoleLog("Socket Hang Up", "debug");
		return;
	}


	err = err.stack.substring(0, 1900) || err;
	framework.consoleLog(`__**Uncaught Exception**__: ${framework.codeBlock(err)}`, "debug");

	exports.modScripts.music.managerDump();
	Object.keys(exports.managers)
	.map(man => exports.managers[man])
	.filter(man => man.data.playing && man.musicChannel)
	.forEach(man => man.sendEmbed("restart"));

	setTimeout(() => {
		bot.disconnect({ reconnect: false });
		process.exit(0);
	}, 5000);
});


bot.on("error", (err, shardid) => {
	if(!err) return;
	err = err.stack.substring(0, 1900) || err;
	framework.consoleLog(`__**Shard Error ${shardid}**__: ${framework.codeBlock(err)}`, "debug");
});

bot.on("shardReady", shardid => framework.consoleLog(`Shard ${shardid} ready`));

exports.addCommand = (command) => {
	if(!exports.commands[command.type]) exports.commands[command.type] = {};
	exports.commands[command.type][command.name] = command;
};

exports.bot = bot;
exports.commands = {};

exports.Command = require("./modules/commandCreator.js");

exports.modScripts = {};
exports.cmdScripts = {};
exports.siteScripts = {};
exports.managers = {};

framework.loadScripts("./modules/");
framework.loadScripts("./commands/");
framework.loadScripts("./site/");

exports.postStats = require("./modules/statPoster.js");
setInterval(() => exports.postStats(), 1800000);
